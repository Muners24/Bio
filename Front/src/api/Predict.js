export const PredictChord = async (file, start_time) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('start_time', start_time);  // <-- aquí

    const response = await fetch('http://localhost:8000/chord/predict/', {
        method: 'POST',
        body: formData,
    });

    if (!response.ok) {
        throw new Error('Error al predecir el acorde');
    }

    let res = await response.json();
    return res.notes;
};
