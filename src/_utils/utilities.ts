import consts from "~config/consts";
import { lucia } from "~config/lucia";
import { db } from "~config/prisma";

export function formatDate(date: Date): string {
    const weekday = new Intl.DateTimeFormat('en-US', { weekday: 'long' }).format(date);
    const day = new Intl.DateTimeFormat('en-US', { day: '2-digit' }).format(date);
    const month = new Intl.DateTimeFormat('en-US', { month: 'long' }).format(date);
    const year = new Intl.DateTimeFormat('en-US', { year: 'numeric' }).format(date);
    const time = new Intl.DateTimeFormat('en-US', { hour: '2-digit', minute: '2-digit', hour12: false }).format(date);

    return `${weekday} ${day}, ${month} ${year} at ${time}hrs`;
}

export function dateToFilename(nowDate: Date = new Date(), extension?: string): string {
    // const nowDate = new Date();
    const year = nowDate.getFullYear();
    const month = String(nowDate.getMonth() + 1).padStart(2, '0');
    const day = String(nowDate.getDate()).padStart(2, '0');
    if(extension){
        return `${year}_${month}_${day}.${extension}`;
    } else{
        return `${year}_${month}_${day}`;
    }
    
}

/*** Splits email into username, discards email provider*/
export function usernameFromEmail(email: string): string {
    // Split the sentence into individual words
    const basket = email.split('@');

    return basket[0];
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

export function phoneSanitizer(phone: string){
    // Remove non-numeric characters
    let cleaned = phone.replace(/\D/g, '');

    // Check if the number has 12 digits and starts with the country code
    if (cleaned.length === 12 && cleaned.startsWith(consts.phone.countryCode.toString())) {
        // Strip the country code
        cleaned = cleaned.slice(consts.phone.countryCode.toString().length);
    }

    // Remove all leading zeros
    cleaned = cleaned.replace(/^0+/, '');

    // Ensure the number is within the required length
    if (cleaned.length >= consts.phone.minLength && cleaned.length <= consts.phone.maxLength) {
        // Append the country code
        const formattedNumber = `${consts.phone.countryCode}${cleaned}`;
        return formattedNumber;
    }

    return null; // Invalid phone number
}

export function monthsToDate(months: number) {
    const newDate = new Date();
    newDate.setMonth(newDate.getMonth() - months);

    // Handle edge cases where subtracting months changes the year
    // and potentially causes issues with days in month
    if (newDate.getMonth() > newDate.getMonth() && newDate.getFullYear() === newDate.getFullYear()) {
        newDate.setDate(0); // Set to last day of the previous month
    }

    return newDate;
}


// Auth


/*** Generate a unique identifier for a device (based on headers) */
export const getDeviceIdentifier = (headers: Headers): string => {
    // Example: Hash of User-Agent + IP or any other unique identifier
    const userAgent = headers.get('user-agent') || 'unknown';
    const ip = headers.get('x-forwarded-for') || headers.get('remote-addr') || 'unknown';
    return Buffer.from(userAgent + ip).toString('hex');
}
