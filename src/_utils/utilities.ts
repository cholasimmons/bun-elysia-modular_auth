export function formatDate(date: Date): string {
    const weekday = new Intl.DateTimeFormat('en-US', { weekday: 'long' }).format(date);
    const day = new Intl.DateTimeFormat('en-US', { day: '2-digit' }).format(date);
    const month = new Intl.DateTimeFormat('en-US', { month: 'long' }).format(date);
    const year = new Intl.DateTimeFormat('en-US', { year: 'numeric' }).format(date);
    const time = new Intl.DateTimeFormat('en-US', { hour: '2-digit', minute: '2-digit', hour12: false }).format(date);

    return `${weekday} ${day}, ${month} ${year} at ${time}hrs`;
}

export function splitWords(sentence: string, index: number = 1): string {
    // Split the sentence into individual words
    const words = sentence.split(' ');

    // Check if the specified index is within the bounds of the words array
    if (index > 0 && index <= words.length) {
        return words[index - 1]; // Return the nth word (1-based index)
    }

    // If the index is out of bounds, return null
    return sentence;
}