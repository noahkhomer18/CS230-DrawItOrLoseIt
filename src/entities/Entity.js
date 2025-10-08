/**
 * Base Entity class following CS 230 Object-Oriented Principles
 * Demonstrates inheritance and encapsulation
 */
class Entity {
    constructor(id, name) {
        if (!id || !name) {
            throw new Error('Entity requires both id and name');
        }
        this._id = id;
        this._name = name;
        this._createdAt = new Date();
    }

    // Getters with proper encapsulation
    get id() {
        return this._id;
    }

    get name() {
        return this._name;
    }

    get createdAt() {
        return this._createdAt;
    }

    // Protected method for name validation
    _validateName(name) {
        if (!name || typeof name !== 'string') {
            throw new Error('Name must be a non-empty string');
        }
        if (name.length < 2 || name.length > 50) {
            throw new Error('Name must be between 2 and 50 characters');
        }
        return name.trim();
    }

    // Method to update name with validation
    updateName(newName) {
        this._name = this._validateName(newName);
    }

    // Abstract method to be implemented by subclasses
    getType() {
        throw new Error('getType() must be implemented by subclass');
    }

    // Method for serialization
    toJSON() {
        return {
            id: this._id,
            name: this._name,
            type: this.getType(),
            createdAt: this._createdAt
        };
    }

    // Equality comparison
    equals(other) {
        if (!other || !(other instanceof Entity)) {
            return false;
        }
        return this._id === other._id;
    }
}

module.exports = Entity;
