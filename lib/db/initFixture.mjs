import { firstNames, nouns, habitats, day } from "./data-fixture.mjs";

// Generate chains
const generateRandomChains = (reqType = 'word') => {
    if (!['word', 'email', 'name', 'habitat', 'description'].includes(reqType)) {
        throw new Error('reqType doit être "word", "email" ou "name".');
    }
    if (reqType === 'email') {
        const email = (randTabSelect(firstNames) + '.' + randTabSelect(nouns) + '@neko.fr').toLowerCase();
        return email;
    } else if (reqType === 'word') {
        const word = randTabSelect(nouns);
        return word;
    } else if (reqType === 'name') {
        const name = randTabSelect(firstNames);
        return name;
    } else if (reqType === 'habitat') {
        const habitatName = randTabSelect(habitats);
        const randomNumber = Math.floor(Math.random() * 1000) + 1;
        const name = `${habitatName}${randomNumber}`;
        return name;
    } else if (reqType === 'description') {
        let description = '';
        for (let i = 0; i < 10; i++) {
            const word = randTabSelect(nouns);
            description += (i > 0 ? ' ' : '') + word;
        }
        return description.charAt(0).toUpperCase() + description.slice(1);
    } else {
        console.log("Rien ne se produit ..");
    }
};

// Function to select random item from array
const randTabSelect = (array) => {
    return array[Math.floor(Math.random() * array.length)];
};

// Generate Fixture for table
const generateRandomAvis = (number) => {
    const randomAvis = [];
    for (let i = 0; i < number; i++) {
        const pseudo = generateRandomChains('name');
        const comment = generateRandomChains('description');
        const isValid = Math.random() < 0.5 ? true : false;
        randomAvis.push({ pseudo, comment, isValid });
    }

    return randomAvis;
};

// Push Fixture on table
export const createAvis = async (connection) => {
    try {
        const randomAvis = generateRandomAvis(10);

        const values = randomAvis.map(log => [log.pseudo, log.comment, log.isValid]);

        const query = `
            INSERT INTO avis (pseudo, comment, isValid)
            VALUES ?
        `;

        await connection.query(query, [values]);

        return randomAvis;

    } catch (error) {
        console.error('Erreur lors de l\'insertion des avis :', error);
        throw error;
    }
};
