const pokeApiEndpoint = `https://pokeapi.co/api/v2/pokemon?limit=25`;
const requestConfig = {
    method: 'GET',
    headers: {
        'Content-Type': 'application/json'
    }
};

/**
 * Returns the pokemon using a specific ID
 * @param {*} id 
 * @returns 
 */
export const getPokemonById = async (id) => {
    return await fetch(`${pokeApiEndpoint}/${id}`, requestConfig);
}

/**
 * Retrieves list of pokemons
 * @param {*} url
 */
export const getPokemons = async (url) => {
    return await fetch(!url ? pokeApiEndpoint : url)
        .then(result => result.json());
}