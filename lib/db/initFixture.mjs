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
const generateRandomUsers = (number) => {
    const users = [];
  
    for (let i = 0; i < number; i++) {
      const email = generateRandomChains('email');
      const password = generateRandomChains('word') + (i + 1);
      const role = Math.random() < 0.5 ? 'EMPLOYEE' : 'VETERINARIAN';
  
      users.push({ email, password, role });
    }
  
    return users;
};

const generateRandomHabitats = (number) => {
    const randomHabitats = [];

    for (let i = 0; i < number; i++) {
        const habitat = generateRandomChains('habitat');
        const description = generateRandomChains('description');
        const comment = generateRandomChains('description');
        const imageUrl = [
            "/public/images/Marais.jpg",
            "/public/images/Marais.jpg"
            
        ];
        randomHabitats.push({ habitat, description, comment, imageUrl });
    }

    return randomHabitats;
};

const generateRandomAnimals = (number, speciesId, habitatId) => {
  const randomAnimals = [];

  for (let i = 0; i < number; i++) {
      const name = generateRandomChains('name');
      const state = Math.random() < 0.5 ? 'Healthy' : 'Sick';
      const imageUrl = [
        "/public/images/Crocodile.png",
        "/public/images/Crocodile.png"
    ];

      // Utiliser les IDs de speciesId et habitatId fournis en paramètres
      const habitat = habitatId[Math.floor(Math.random() * habitatId.length)];
      const specie = speciesId[Math.floor(Math.random() * speciesId.length)];

      randomAnimals.push({ name, state, imageUrl, habitat, specie });
  }

  return randomAnimals;
};

const generateRandomVetLogs = (number, animalIds) => {
  const randomVetLogs = [];
  const possibleStates = ['Healthy', 'Sick', 'Injured'];
  const possibleFoods = ['Meat', 'Grass', 'Fruits', 'Vegetables'];

  for (let i = 0; i < number; i++) {
      const animalId = animalIds[Math.floor(Math.random() * animalIds.length)];
      const animalState = possibleStates[Math.floor(Math.random() * possibleStates.length)];
      const foodOffered = possibleFoods[Math.floor(Math.random() * possibleFoods.length)];
      const foodWeight = Math.floor(Math.random() * 1000) + 1;

      randomVetLogs.push({ animalId, animalState, foodOffered, foodWeight });
  }

  return randomVetLogs;
};

const generateRandomReport = (number, animalIds) => {
  const randomReport = [];
  const possibleFoods = ['Meat', 'Grass', 'Fruits', 'Vegetables'];

  for (let i = 0; i < number; i++) {
      const animalId = animalIds[Math.floor(Math.random() * animalIds.length)];
      const food = possibleFoods[Math.floor(Math.random() * possibleFoods.length)];
      const quantity = Math.floor(Math.random() * 1000) + 1;
      randomReport.push({ animalId, food, quantity });
  }

  return randomReport;
};

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

const generateHours = () => {
  const hours = [];

  for (let i = 0; i < 7; i++) {
    const days = day[i];
    const open = '8h00';
    const close = '20h00';
    hours.push({ days, open, close });
  }

  return hours;
};

const generateRandomServices = (number) => {
  const services = [];

  for (let i = 0; i < number; i++) {
    const name = generateRandomChains('name');
    const description = generateRandomChains('description');

    services.push({ name, description });
  }

  return services;
};

// Push Fixture on table

export const createUsers = async (connection) => {
    try {
      const users = generateRandomUsers(10);
      const values = users.map(user => [user.email, user.password, user.role]);
  
      const query = `
        INSERT INTO users (email, password, role)
        VALUES ?
      `;
  
      await connection.query(query, [values]);
  
    } catch (error) {
      console.error('Erreur lors de l\'insertion des utilisateurs :', error);
      throw error;
    }
};
  
export const createHabitats = async (connection) => {
    try {
      const habitats = generateRandomHabitats(2);
      const insertedIds = [];
  
      for (let habitat of habitats) {
        const imageUrlJson = JSON.stringify(habitat.imageUrl);
        const query = `
          INSERT INTO habitats (name, description, comment, imageUrl)
          VALUES (?, ?, ?, ?);
        `;
        const result = await connection.query(query, [habitat.habitat, habitat.description, habitat.comment, imageUrlJson]);
        const insertId = result[0].insertId;
        insertedIds.push(insertId);
      }
  
      return insertedIds;
  
    } catch (error) {
      console.error('Erreur lors de l\'insertion des habitats :', error);
      throw error;
    }
};
  
export const createSpecies = async (connection) => {
    try {
      await connection.query(`
        CREATE TABLE IF NOT EXISTS species (
          id INT AUTO_INCREMENT PRIMARY KEY,
          name VARCHAR(50) NOT NULL UNIQUE
        );
      `);
  
      const numberOfSpecies = 5;
      const speciesNames = [];
  
      for (let i = 0; i < numberOfSpecies; i++) {
        const species = generateRandomChains('word');
        const randomNumber = Math.floor(Math.random() * 1000) + 1;
        const speciesName = `${species}${randomNumber}`;
        speciesNames.push([speciesName]);
      }
  
      const query = `
        INSERT INTO species (name)
        VALUES ?
      `;
  
      const result = await connection.query(query, [speciesNames]);
  
      const insertedIds = [];
      for (let i = 0; i < result[0].affectedRows; i++) {
        insertedIds.push(result[0].insertId + i);
      }
  
      return insertedIds;
  
    } catch (error) {
      console.error('Erreur lors de la création de la table species ou de l\'insertion des species :', error);
      throw error;
    }
};
  
export const createAnimals = async (connection, numberOfAnimals, speciesIds, habitatIds) => {
    try {
      const randomAnimals = generateRandomAnimals(numberOfAnimals, speciesIds, habitatIds);
      const values = randomAnimals.map(animal => [animal.name, animal.etat, JSON.stringify(animal.imageUrl), animal.habitat, animal.specie]);
  
      const query = `
        INSERT INTO animals (name, etat, imageUrl, habitatId, specieId)
        VALUES ?
      `;
  
      const result = await connection.query(query, [values]);
  
      const insertedIds = [];
      for (let i = 0; i < result[0].affectedRows; i++) {
        insertedIds.push(result[0].insertId + i);
      }
  
      return insertedIds;
  
    } catch (error) {
      console.error('Erreur lors de l\'insertion des animaux :', error);
      throw error;
    }
};
  
export const createVetLogs = async (connection, numberOfLogs, animalIds) => {
    try {
      const randomVetLogs = generateRandomVetLogs(numberOfLogs, animalIds);
      const values = randomVetLogs.map(log => [log.animalId, log.animalState, log.foodOffered, log.foodWeight]);
  
      const query = `
        INSERT INTO vetLogs (animalId, animalState, foodOffered, foodWeight)
        VALUES ?
      `;
  
      await connection.query(query, [values]);
  
      return randomVetLogs;
  
    } catch (error) {
      console.error('Erreur lors de l\'insertion des journaux vétérinaires :', error);
      throw error;
    }
};
  
export const createReport = async (connection, numberOfLogs, animalIds) => {
    try {
      const randomReport = generateRandomReport(numberOfLogs, animalIds);
      const values = randomReport.map(log => [log.animalId, log.food, log.quantity]);
  
      const query = `
        INSERT INTO reports (animalId, food, quantity)
        VALUES ?
      `;
  
      await connection.query(query, [values]);
  
      return randomReport;
  
    } catch (error) {
      console.error('Erreur lors de l\'insertion des journaux employée :', error);
      throw error;
    }
};

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

export const createHours = async (connection) => {
    try {
      const hours = generateHours();
  
      const values = hours.map(hour => [hour.days, hour.open, hour.close]);
  
      const query = `
        INSERT INTO hours (days, open, close)
        VALUES ?
      `;
      
      await connection.query(query, [values]);
  
      return hours;
  
    } catch (error) {
      console.error('Erreur lors de l\'insertion des heures :', error);
      throw error;
    }
};
  
export const createServices = async (connection) => {
    try {
      const services = generateRandomServices(4);
      
      const values = services.map(service => [service.name, service.description]);
  
      const query = `
        INSERT INTO services (name, description)
        VALUES ?
      `;
      
      await connection.query(query, [values]);
  
      return services;
  
    } catch (error) {
      console.error('Erreur lors de l\'insertion des services :', error);
      throw error;
    }
};
