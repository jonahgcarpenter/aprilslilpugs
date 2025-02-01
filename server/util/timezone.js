const parseCentralTime = (dateString) => {
    if (!dateString) return null;
    
    try {
        // Parse the date parts from YYYY-MM-DD format
        const [year, month, day] = dateString.split('-').map(Number);
        
        // Create a UTC date using the components
        return new Date(Date.UTC(year, month - 1, day, 6, 0, 0));
    } catch (error) {
        return null;
    }
};

const convertToCentralTime = (date) => {
    if (!date) return null;
    
    // Convert to YYYY-MM-DD format in Central Time
    const d = new Date(date);
    const utcDate = new Date(d.getTime() + (6 * 60 * 60 * 1000)); // Add 6 hours to adjust for CT
    return utcDate.toISOString().split('T')[0];
};

module.exports = { convertToCentralTime, parseCentralTime };
