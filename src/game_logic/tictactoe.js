//import makeWasm from './tictactoe.wasm';

export default async function() {
    return WebAssembly.instantiateStreaming(fetch('/tictactoe.wasm'), {
        'global': {},
        'env': {
        'abort': () => {console.error("abort in wasm!"); throw new Error("Unsupported wasm api: abort");},
        'require': (b) => {if(!b){console.error("require failed"); throw new Error("Require failed");}},
        'wasm_input': () => {
        console.error("wasm_input should not been called in non-zkwasm mode");
        throw new Error("Unsupported wasm api: wasm_input");
        }
        }
     })
    .then(results => results.instance.exports);
}

/*export default async function () {
 module = await makeWasm({
    'global': {},
    'env': {
    'memory': new Memory({ initial: 10, limit: 100 }),
    'table': new Table({ initial: 0, element: 'anyfunc' }),
    'abort': () => {console.error("abort in wasm!"); throw new Error("Unsupported wasm api: abort");},
    'require': (b) => {if(!b){console.error("require failed"); throw new Error("Require failed");}},
    'wasm_input': () => {
    console.error("wasm_input should not been called in non-zkwasm mode");
    throw new Error("Unsupported wasm api: wasm_input");
    }
    }
 });
 return instance.exports;
}*/