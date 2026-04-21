const sleep = (ms) => new Promise(res => setTimeout(res, ms));

let lastCallTime = 0;
const MIN_GAP = 1200; // global spacing between ANY ORS call

async function throttle() {
    const now = Date.now();
    const diff = now - lastCallTime;

    if (diff < MIN_GAP) {
        await sleep(MIN_GAP - diff);
    }

    lastCallTime = Date.now();
}

async function safeORSCall(fn, retries = 5) {
    let lastError = null;

    for (let i = 0; i < retries; i++) {
        try {
            // 🔥 PREVENT BURST BEFORE REQUEST
            await throttle();

            return await fn();
        } catch (err) {
            lastError = err;

            const status = err?.response?.status;

            // 🚨 RATE LIMIT (429)
            if (status === 429) {
                const waitTime = 1500 * Math.pow(2, i); // exponential backoff
                console.warn(`ORS 429 hit → retrying in ${waitTime}ms`);
                await sleep(waitTime);
                continue;
            }

            // 🌐 NETWORK / TEMP FAILURES
            await sleep(800);
        }
    }

    console.error("ORS failed after retries:", lastError?.message);
    return null;
}

module.exports = { safeORSCall, sleep };