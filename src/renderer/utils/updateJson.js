const fs = require('fs');

/**
 * Update a field in the update.json file.
 * 
 * @param {string} field - The field to update.
 * @param {string} value - The new value for the field.
 * @param {string} value - The update.json path.
 * @returns {Promise<void>}
 */
async function updateJson(field, value, path) {
    try {
        // Read the current content of the update.json file
        const data = await fs.promises.readFile(path, 'utf8');
        
        // Parse the JSON data
        const updateJson = JSON.parse(data);

        // Update the specified field
        // eslint-disable-next-line no-prototype-builtins
        if (updateJson.hasOwnProperty(field)) {
            updateJson[field] = value;

            // Write the updated JSON back to the file
            await fs.promises.writeFile(path, JSON.stringify(updateJson, null, 4), 'utf8');
            console.log(`Successfully updated ${field} to ${value}`);
        } else {
            console.error(`Field "${field}" does not exist in the JSON file.`);
        }
    } catch (error) {
        console.error('Error updating update.json:', error);
    }
}

module.exports = { updateJson };
