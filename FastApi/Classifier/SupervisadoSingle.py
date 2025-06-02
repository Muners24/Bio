import torch
import os
import matplotlib.pyplot as plt
import numpy as np
import torchaudio
from dataset import MusicalObjectDataModule, spec_crop
from torchvision import transforms
from functools import partial
from models.MusicSlots.slot_attention import SlotAttentionAE
from models.Baselines.supervised import SupervisedClassifier
import mido
from mido import MidiFile, MidiTrack, Message, MetaMessage, bpm2tempo

import torch.nn.functional as F
from models.Baselines.utils import get_distributed_labels

def midi_to_note_name(midi_note):
    note_names = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B']
    octave = (midi_note // 12) - 1
    note = note_names[midi_note % 12]
    return f"{note}{octave}"
    
def load_audio_to_mel_spectrogram(audio_path, sample_rate=16000, n_mels=128, n_fft=2048,
                                   hop_length=512, top_db=80.0, to_db=True, start_time_ms=0):
    """
    Carga un archivo de audio y convierte a espectrograma Mel. Puede empezar desde `start_time_ms` milisegundos.
    """
    waveform, sr = torchaudio.load(audio_path)

    if sr != sample_rate:
        resampler = torchaudio.transforms.Resample(orig_freq=sr, new_freq=sample_rate)
        waveform = resampler(waveform)
        sr = sample_rate

    # Convertir a mono si es estéreo
    if waveform.shape[0] > 1:
        waveform = waveform.mean(dim=0, keepdim=True)

    # Cortar desde `start_time_ms`
    start_sample = int((start_time_ms / 1000) * sr)  # convertir ms a segundos para sample index
    if start_sample < waveform.shape[1]:
        waveform = waveform[:, start_sample:]
    else:
        raise ValueError(f"start_time_ms={start_time_ms} está fuera del rango del audio.")

    mel_spectrogram = torchaudio.transforms.MelSpectrogram(
        sample_rate=sr,
        n_fft=n_fft,
        hop_length=hop_length,
        n_mels=n_mels,
    )(waveform)

    if to_db:
        mel_spectrogram = torchaudio.transforms.AmplitudeToDB(top_db=top_db)(mel_spectrogram)

    return mel_spectrogram

def classify_audio_file(audio_path, sa_model, sc_model, dm, sa_hparams,start_time):
    """
    Dado un path a un archivo de audio, procesa y clasifica las notas usando los modelos cargados.
    """

    # Cargar audio y obtener espectrograma mel
    mel_spec = load_audio_to_mel_spectrogram(audio_path,
                                             sample_rate=16000,
                                             n_mels=sa_hparams['resolution'][0],
                                             top_db=sa_hparams['top_db'],
                                             start_time_ms=start_time)

    # Aplicar transformaciones (recorte, etc)
    spec_crop_fn = partial(spec_crop, height=sa_hparams['resolution'][0], width=sa_hparams['resolution'][1])
    mel_spec_cropped = spec_crop_fn(mel_spec)

    # Añadir batch y canal
    input_tensor = mel_spec_cropped.unsqueeze(0)  # [1, 1, H, W]

    with torch.no_grad():
        # Obtener reconstrucción y slots desde SA
        recon_combined, recons, masks, slots = sa_model(input_tensor)

        if recons.shape[2] != 1:
            recons = recons.permute(0, 1, 4, 2, 3)

        all_probs = []
        for slot_i in range(sa_model.hparams.num_slots):
            slot_recon = recons[:, slot_i]
            # Puedes probar también con slot_recon = recons[:, slot_i]
            logits = sc_model(input_tensor)  # [batch, num_notes]
            probs = torch.sigmoid(logits)
            all_probs.append(probs)

        probs_per_slot = torch.stack(all_probs, dim=1)  # [batch, num_slots, num_notes]
        summed_probs = probs_per_slot.sum(dim=1)        # [batch, num_notes]
        pred_binary = (summed_probs >= (probs_per_slot.shape[1] / 2)).float()  # voto mayoritario
        pred_binary = pred_binary.squeeze(0).cpu().numpy()  # eliminar batch

    midi_base_note = 21

    active_note_indices = np.where(pred_binary == 1)[0]
    if len(active_note_indices) == 0:
        return []
    
    note_names = [midi_to_note_name(midi_base_note + idx) for idx in active_note_indices]
    return note_names


def Classify(audio_path,start_time):
    sa_hparams = {
        'in_channels': 1,
        'resolution': (128, 32),
        'lr': 1e-4,
        'warmup_steps': 5000,
        'decay_steps': 100000,
        'num_slots': 7,
        'num_iter': 3,
        'd_slot': 128,
        'd_mlp': 128,
        'eps': 1e-8,
        'use_implicit': False,
        'share_slot_init': True,
        'alpha_mask_type': "softmax",
        'kernel_height': 5,
        'num_encoder_layers': 4,
        'num_strided_decoder_layers': 4,
        'use_deconv': True,
        'grad_clip_val': 1.0,
        'stride': (2, 2),
        'db_thres': -30.0,
        'to_db': True,
        'top_db': 80.0,
        'encoder_type': 'simple',
        'num_to_log': 5,
        'logging_epoch_freq': 25,
    }

    root = 'data/jsb_single'
    batch_size = 8

    dm = MusicalObjectDataModule(
        root=root,
        to_db=True,
        spec='mel',
        top_db=sa_hparams['top_db'],
        batch_size=batch_size,
        num_workers=0,
        seed=42,
    )
    img_transforms = [transforms.Lambda(partial(spec_crop, height=sa_hparams['resolution'][0], width=sa_hparams['resolution'][1]))]
    dm.test_transforms = transforms.Compose(img_transforms)
    dm.val_transforms = dm.test_transforms
    dm.setup()

    sa_ckpt_path = "checkpoints/musicslots_linear.ckpt"
    sa_model = SlotAttentionAE.load_from_checkpoint(sa_ckpt_path)
    sa_model.eval()
    sa_model.freeze()

    sc_ckpt_path = "checkpoints/supervisadoSingle.ckpt"
    sc_model = SupervisedClassifier.load_from_checkpoint(
        sc_ckpt_path,
        in_channels=1,
        resolution=sa_hparams['resolution'],
        lr=1e-3,
        backbone="simple",
        num_notes=dm.num_notes,
        num_instruments=dm.num_instruments,
        stride=sa_hparams['stride'],
        hidden_dim=128
    )
    sc_model.eval()
    sc_model.freeze()
    
    return classify_audio_file(audio_path, sa_model, sc_model, dm, sa_hparams,start_time)

