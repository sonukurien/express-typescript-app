import * as vm from 'vm';
import * as Module from 'module';
import { posix as path } from 'path';

const disabledModules: string[] = ['child_process', 'cluster', 'fs'];
let codes: { [key: string]: Function } = {};
let codeModules: { [key: string]: CodeModule } = {};

class CodeModule {
    filename: string | undefined;
    exports: any;

    constructor(id: string) {
        Object.defineProperties(this, {
            id: {
                value: id
            },
            filename: {
                value: id + '.js'
            }
        });
        this.exports = {};
    }

    static load(id: string): CodeModule | null {
        let codeModule = codeModules[id];

        if (codeModule)
            return codeModule;

        if (!codes[id])
            return null;

        const moduleParent = id.substring(0, id.lastIndexOf('/') + 1);

        function require(module: string): any {
            if (module.indexOf('.') === 0) {
                module = path.join(moduleParent, module);
            }
            return CodeModule.require(module);
        }

        codeModule = codeModules[id] = new CodeModule(id);
        try {
            codes[id].apply(codeModule.exports, [codeModule.exports, require, codeModule, codeModule.filename, 'code']);
            return codeModule;
        } catch (e) {
            codeModules = {};
            throw e;
        }
    }

    static require(module: string, defaultValue?: any): any {
        module = path.normalize(module);

        const codeModule = CodeModule.load(module);
        if (codeModule) {
            return codeModule.exports;
        }

        const index = module.indexOf('/');
        const nodeModule = index > -1 ? module.substring(0, index) : module;
        if (nodeModule && disabledModules.indexOf(nodeModule) === -1)
            return require(module);

        if (defaultValue !== void 0)
            return defaultValue;

        throw new Error('The node module "' + module + '" is not available.');
    }

    static compile(id: string, code: string): Function {
        const wrapper = Module.Module.wrap(code);
        return vm.runInThisContext(wrapper, {
            filename: id + '.js'
        });
    }

    static compileScript(id: string, code: string): vm.Script {
        return new vm.Script(code, {
            filename: id + '.js'
        });
    }

    static register(id: string, code: string): void {
        codes[id] = CodeModule.compile(id, code);
        codeModules = {};
    }

    static clear(): void {
        codes = {};
        codeModules = {};
    }

    static unregister(id: string): void {
        codeModules = {};
        delete codes[id];
    }
}

export default CodeModule;