const translateDoc = (doc, lang, fields) => {
    if (!doc || !lang || !fields) return doc;
    const translated = JSON.parse(JSON.stringify(doc));
    const setNestedValue = (obj, path, value) => {
        const keys = path.split('.'); let current = obj;
        for (let i = 0; i < keys.length - 1; i++) {
            const key = keys[i]; if (current[key] === undefined) return; current = current[key];
        }
        if (current) current[keys[keys.length - 1]] = value;
    };
    fields.forEach(fieldPath => {
        const keys = fieldPath.split('.'); let currentVal = doc;
        for (const key of keys) {
            if (currentVal === null || typeof currentVal === 'undefined') { currentVal = undefined; break; }
            currentVal = currentVal[key];
        }
        if (typeof currentVal === 'object' && currentVal !== null && (currentVal.en || currentVal.ar)) {
            setNestedValue(translated, fieldPath, currentVal[lang] || currentVal.en || currentVal.ar);
        }
    });
    if (translated.category?.subCategories && Array.isArray(translated.category.subCategories)) {
        translated.category.subCategories = translated.category.subCategories.map(sc => translateDoc(sc, lang, ['name']));
    }
    return translated;
};

module.exports = { translateDoc };