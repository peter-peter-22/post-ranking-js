/** Normalize a vector */
export function normalizeVector(vector:number[]) {
    // Calculate the magnitude (length) of the vector
    const magnitude = Math.sqrt(vector.reduce((sum, component) => sum + component * component, 0));
    
    // Handle the case where magnitude is 0 (to avoid division by zero)
    if (magnitude === 0) {
        return vector.map(() => 0); // Return zero vector
    }
    
    // Normalize each component by dividing by the magnitude
    return vector.map(component => component / magnitude);
}