class TransformersExtension {
    constructor() {
        this.transformers_loaded = false;
        this.tokenizer = null;
        this.model = null;
        this.generating = false;
        this.chat = [];  // Stores full conversation history
        this.chatbotModel = 'Xenova/gpt2';
        this.maxLength = 150
        const outputs = null;
        const decoded = null;
    }

    getInfo() {
        return {
            id: 'transformers',
            name: 'Transformers',
            blocks: [
                {
                    opcode: 'generateText',
                    blockType: Scratch.BlockType.REPORTER,
                    text: 'generate text from [TEXT] with max length [MAX]',
                    arguments: {
                        TEXT: { type: Scratch.ArgumentType.STRING, defaultValue: 'Hello world' },
                        MAX: { type: Scratch.ArgumentType.NUMBER, defaultValue: 150 }
                    },
                    hideFromPalette: true
                },
                {
                    opcode: 'textGeneration',
                    blockType: Scratch.BlockType.REPORTER,
                    text: 'generate text using prompt [TEXT]',
                    arguments: {
                        TEXT: { type: Scratch.ArgumentType.STRING, defaultValue: 'Hello world' }
                    }
                },
                {
                    opcode: 'setModel',
                    blockType: Scratch.BlockType.COMMAND,
                    text: 'set chatbot model to [MODEL]',
                    arguments: {
                        MODEL: { type: Scratch.ArgumentType.STRING, menu: 'MODELS'}
                    }
                },
                {
                    opcode: 'clearChat',
                    blockType: Scratch.BlockType.COMMAND,
                    text: 'Clear Chat'
                },
                {
                    opcode: 'setMaxLength',
                    blockType: Scratch.BlockType.COMMAND,
                    text: 'Set max length to [MAXLENGTH]',
                    arguments: {
                        MAXLENGTH: { type: Scratch.ArgumentType.NUMBER, defaultValue: 150}
                    }
                },
                {
                    opcode: 'getChat',
                    blockType: Scratch.BlockType.REPORTER,
                    text: 'Chat history'
                },
                {
                    opcode: 'checkGenStatus',
                    blockType: Scratch.BlockType.BOOLEAN,
                    text: 'is generating?'
                }
            ],
            menus: {
                MODELS: {
                  acceptReporters: true,
                  items: ['Xenova/gpt2', 'Xenova/llama2.c-stories15M','onnx-community/Llama-3.2-1B-Instruct']
                }
          }
        };
    }

    async loadTransformers() {
        if (!this.transformers_loaded) {
            const { AutoModelForCausalLM, AutoTokenizer } = await import('https://cdn.jsdelivr.net/npm/@xenova/transformers');
            this.AutoModelForCausalLM = AutoModelForCausalLM;
            this.AutoTokenizer = AutoTokenizer;
            this.transformers_loaded = true;
        }
    }

    async generateText(input) {
        this.generating = true;
        await this.loadTransformers();
        if (!this.tokenizer || !this.model) {
            this.tokenizer = await this.AutoTokenizer.from_pretrained(this.chatbotModel);
            this.model = await this.AutoModelForCausalLM.from_pretrained(this.chatbotModel);
        }
        let { input_ids } = await this.tokenizer(input);
        let outputs = await this.model.generate(input_ids,{ max_new_tokens: this.maxLength }); // Fix here
        let decoded = this.tokenizer.decode(outputs[0], { skip_special_tokens: true });
        this.generating = false;
        return decoded.trim() || "I don't know what to say.";
    }


    setMaxLength(args) {
        this.maxLength = args.MAXLENGTH; // Fix here
    }


    async textGeneration(args) {
        return await this.generateText(String(args.TEXT));
    }

    checkGenStatus() {
        return this.generating;
    }

    clearChat() {
        this.chat = [];
    }

    getChat() {
        return this.chat.map(entry => `${entry.role === "user" ? "User" : "Assistant"}: ${entry.content}`).join("\n");
    }

    setModel(args) {
        this.chatbotModel = args.MODEL;
        this.tokenizer = null;
        this.model = null; // Reset tokenizer and model to allow reloading with new model
    }
    setMaxLength(args) {
        this.maxlength = args.MAXLENGTH
    }
}

Scratch.extensions.register(new TransformersExtension());
