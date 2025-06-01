export const PredictChord = async (file) => {
    const formData = new FormData();
    formData.append('file', file);

    const response = await fetch('http://localhost:8000/chord/predict/', {
        method: 'POST',
        body: formData,
    });

    if (!response.ok) {
        throw new Error('Error al predecir el acorde');
    }

    let res = await await response.json();
    return res.notes;
};
