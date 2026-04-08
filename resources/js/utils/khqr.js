/**
 * A basic KHQR EMVCo Payload generator for offline POS.
 * 
 * Note: A true production KHQR string requires:
 * 1. Your specific Bank's Merchant ID / Bakong Account ID.
 * 2. Proper CRC16 CCITT validation checksum appended to the end.
 * 
 * This generator builds a structured mock payload so the scanning 
 * interface works in our demo environment. We pad standard EMVCo tag 
 * lengths automatically.
 */
export function generateKHQRPayload(amountKhr, merchantName = "Mart 2500") {
    // Helper to format EMVCo tags (00-99) and lengths (fixed 2 digits)
    const tl = (tag, value) => {
        const strVal = String(value);
        // length must be exactly 2 characters, zero-padded if necessary
        const len = strVal.length.toString().padStart(2, '0');
        return `${tag}${len}${strVal}`;
    };

    let payload = "";
    
    // 00: Payload Format Indicator (01)
    payload += tl("00", "01");
    
    // 01: Point of Initiation Method (12 = Dynamic, exact amount)
    payload += tl("01", "12");
    
    // 29-51: Merchant Account Information (Bakong uses specific tags here)
    // We mock tag 29 globally for KHQR
    payload += tl("29", 
        tl("00", "A000000615") + // Application Default (Mock Bakong AID)
        tl("01", "dev_mart2500@bakong") // Merchant Bakong ID
    );

    // 52: Merchant Category Code (random/placeholder MCC for retail)
    payload += tl("52", "5411"); 
    
    // 53: Transaction Currency (116 = KHR)
    payload += tl("53", "116");
    
    // 54: Transaction Amount
    payload += tl("54", amountKhr.toString());
    
    // 58: Country Code
    payload += tl("58", "KH");
    
    // 59: Merchant Name
    payload += tl("59", merchantName);
    
    // 60: Merchant City
    payload += tl("60", "Phnom Penh");

    // 63: CRC Data (Placeholder to close it out)
    // In production, you calculate CRC16 over the *entire payload so far* including the '6304' header!
    payload += "6304" + "ABCD"; // Pseudo-checksum

    return payload;
}
