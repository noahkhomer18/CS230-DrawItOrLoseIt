/**
 * NameValidator utility class for CS 230 unique name requirements
 * Provides comprehensive validation for game, team, and player names
 */
class NameValidator {
    constructor() {
        this._reservedWords = new Set([
            'admin', 'system', 'game', 'player', 'team', 'user',
            'guest', 'anonymous', 'null', 'undefined', 'test'
        ]);
        
        this._minLength = 2;
        this._maxLength = 50;
    }

    /**
     * Validate a name according to CS 230 requirements
     * @param {string} name - Name to validate
     * @param {string} type - Type of entity (game, team, player)
     * @returns {Object} Validation result with success boolean and message
     */
    validateName(name, type = 'entity') {
        const result = {
            isValid: false,
            message: '',
            normalizedName: ''
        };

        // Check if name exists
        if (!name) {
            result.message = `${type} name is required`;
            return result;
        }

        // Check if name is string
        if (typeof name !== 'string') {
            result.message = `${type} name must be a string`;
            return result;
        }

        // Trim and normalize name
        const trimmedName = name.trim();
        const normalizedName = trimmedName.toLowerCase();

        // Check length requirements
        if (trimmedName.length < this._minLength) {
            result.message = `${type} name must be at least ${this._minLength} characters long`;
            return result;
        }

        if (trimmedName.length > this._maxLength) {
            result.message = `${type} name must be no more than ${this._maxLength} characters long`;
            return result;
        }

        // Check for reserved words
        if (this._reservedWords.has(normalizedName)) {
            result.message = `${type} name cannot be a reserved word`;
            return result;
        }

        // Check for valid characters (alphanumeric, spaces, hyphens, underscores)
        if (!/^[a-zA-Z0-9\s\-_]+$/.test(trimmedName)) {
            result.message = `${type} name can only contain letters, numbers, spaces, hyphens, and underscores`;
            return result;
        }

        // Check for consecutive special characters
        if (/[\s\-_]{2,}/.test(trimmedName)) {
            result.message = `${type} name cannot have consecutive special characters`;
            return result;
        }

        // Check for names that start or end with special characters
        if (/^[\s\-_]|[\s\-_]$/.test(trimmedName)) {
            result.message = `${type} name cannot start or end with special characters`;
            return result;
        }

        // All validations passed
        result.isValid = true;
        result.message = 'Name is valid';
        result.normalizedName = normalizedName;
        result.originalName = trimmedName;

        return result;
    }

    /**
     * Validate multiple names at once
     * @param {Array} names - Array of name objects with name and type
     * @returns {Object} Validation results for all names
     */
    validateMultipleNames(names) {
        const results = {
            allValid: true,
            results: [],
            errors: []
        };

        for (const nameObj of names) {
            const validation = this.validateName(nameObj.name, nameObj.type);
            results.results.push({
                name: nameObj.name,
                type: nameObj.type,
                ...validation
            });

            if (!validation.isValid) {
                results.allValid = false;
                results.errors.push(`${nameObj.type} "${nameObj.name}": ${validation.message}`);
            }
        }

        return results;
    }

    /**
     * Check if two names are equivalent (case-insensitive)
     * @param {string} name1 - First name
     * @param {string} name2 - Second name
     * @returns {boolean} True if names are equivalent
     */
    areNamesEquivalent(name1, name2) {
        if (!name1 || !name2) return false;
        return name1.trim().toLowerCase() === name2.trim().toLowerCase();
    }

    /**
     * Generate a unique name suggestion based on a base name
     * @param {string} baseName - Base name to work from
     * @param {Set} existingNames - Set of existing names to avoid
     * @returns {string} Suggested unique name
     */
    generateUniqueName(baseName, existingNames = new Set()) {
        if (!baseName) {
            baseName = 'NewEntity';
        }

        const cleanBase = baseName.trim().replace(/[^a-zA-Z0-9\s\-_]/g, '');
        let suggestion = cleanBase;
        let counter = 1;

        while (existingNames.has(suggestion.toLowerCase())) {
            suggestion = `${cleanBase}${counter}`;
            counter++;
        }

        return suggestion;
    }

    /**
     * Get validation rules for display to users
     * @returns {Object} Validation rules object
     */
    getValidationRules() {
        return {
            minLength: this._minLength,
            maxLength: this._maxLength,
            allowedCharacters: 'Letters, numbers, spaces, hyphens, underscores',
            reservedWords: Array.from(this._reservedWords),
            examples: {
                valid: ['Team Alpha', 'Player-1', 'My_Game', 'Team 2024'],
                invalid: ['', 'A', 'admin', 'Team--Alpha', ' Team', 'Team ']
            }
        };
    }

    /**
     * Set custom validation rules
     * @param {Object} rules - Custom validation rules
     */
    setCustomRules(rules) {
        if (rules.minLength) this._minLength = rules.minLength;
        if (rules.maxLength) this._maxLength = rules.maxLength;
        if (rules.reservedWords) {
            this._reservedWords = new Set(rules.reservedWords);
        }
    }
}

module.exports = NameValidator;
