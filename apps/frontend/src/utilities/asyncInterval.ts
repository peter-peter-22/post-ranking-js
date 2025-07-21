export function createAsyncInterval(asyncFn: () => Promise<void>, intervalMs: number) {
    let stopped = false;

    async function loop() {
        while (!stopped) {
            await asyncFn();
            if (!stopped) {
                await new Promise(r => setTimeout(r, intervalMs));
            }
        }
    }

    loop();

    return () => {
        stopped = true;
    }

}
