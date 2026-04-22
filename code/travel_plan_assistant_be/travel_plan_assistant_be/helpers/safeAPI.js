const sleep = (ms) => new Promise(res => setTimeout(res, ms));

async function safeApiCall(fn, retries = 3) {
    let lastError;

    for (let i = 0; i < retries; i++) {
        try {
            return await fn();
        } catch (err) {
            lastError = err;

            const status = err?.response?.status;

            console.log("API TRY FAILED:", err.response?.data || err.message);

            const isRetryable =
                !status ||
                status === 429 ||
                status === 500 ||
                status === 503;

            if (!isRetryable) break;

            const wait = 1000 * Math.pow(2, i);
            const jitter = Math.random() * 200;

            await sleep(wait + jitter);
        }
    }

    throw lastError;
}

module.exports = { safeApiCall, sleep };