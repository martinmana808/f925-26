<script>
  import Layout from '../../components/layout/Layout.svelte';

  function printDocument() {
    window.print();
  }
</script>

<style>
    /* Remove global styles and scope everything to the document class */

    :global(.document) {
      z-index: 9999999999;
      position: relative;
        max-width: 210mm;
        margin: 0 auto;
        padding: 25mm;
        background: white;
        box-shadow: 0 0 20px rgba(0,0,0,0.1);
        min-height: 297mm;
        font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
        line-height: 1.6;
        color: #2c3e50;
        background: #ffffff;
        font-size: 14px;
    }
    
    :global(.document) .header {
        text-align: center;
        margin-bottom: 40px;
        padding-bottom: 20px;
        border-bottom: 2px solid #3498db;
    }
    
    :global(.document) .title {
        font-size: 28px;
        font-weight: 700;
        color: #2c3e50;
        margin-bottom: 10px;
        line-height: 1.2;
    }
    
    :global(.document) .subtitle {
        font-size: 16px;
        color: #7f8c8d;
        font-weight: 400;
        font-style: italic;
    }
    
    :global(.document) .abstract {
        background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
        padding: 25px;
        border-radius: 12px;
        margin-bottom: 35px;
        border-left: 4px solid #3498db;
    }
    
    :global(.document) .abstract h3 {
        color: #2c3e50;
        font-size: 16px;
        font-weight: 600;
        margin-bottom: 12px;
    }
    
    :global(.document) .abstract p {
        font-size: 13px;
        line-height: 1.7;
        color: #4a5568;
    }
    
    :global(.document) h1 {
        font-size: 22px;
        font-weight: 600;
        color: #2c3e50;
        margin: 35px 0 20px 0;
        padding-bottom: 8px;
        border-bottom: 2px solid #3498db;
    }
    
    :global(.document) h2 {
        font-size: 18px;
        font-weight: 600;
        color: #34495e;
        margin: 30px 0 15px 0;
        padding-left: 15px;
        border-left: 3px solid #e74c3c;
    }
    
    :global(.document) h3 {
        font-size: 16px;
        font-weight: 500;
        color: #2c3e50;
        margin: 25px 0 12px 0;
    }
    
    :global(.document) h4 {
        font-size: 14px;
        font-weight: 500;
        color: #2c3e50;
        margin: 20px 0 10px 0;
    }
    
    :global(.document) p {
        margin-bottom: 15px;
        text-align: justify;
        line-height: 1.7;
    }
    
    :global(.document) .concept {
        background: #f8f9fa;
        border: 1px solid #dee2e6;
        border-radius: 8px;
        padding: 15px;
        margin: 15px 0;
    }
    
    :global(.document) .concept-title {
        font-weight: 600;
        color: #495057;
        margin-bottom: 8px;
    }
    
    :global(.document) .highlight {
        background: linear-gradient(120deg, #a8edea 0%, #fed6e3 100%);
        padding: 2px 6px;
        border-radius: 4px;
        font-weight: 500;
    }
    
    :global(.document) .example-box {
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        color: white;
        padding: 20px;
        border-radius: 12px;
        margin: 20px 0;
    }
    
    :global(.document) .example-box h4 {
        color: white;
        margin-bottom: 10px;
    }
    
    :global(.document) .steps {
        background: #f8f9fa;
        border-radius: 10px;
        padding: 20px;
        margin: 20px 0;
    }
    
    :global(.document) .step {
        margin-bottom: 15px;
        padding-left: 25px;
        position: relative;
    }
    
    :global(.document) .step-number {
        position: absolute;
        left: 0;
        top: 0;
        background: #3498db;
        color: white;
        width: 20px;
        height: 20px;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 12px;
        font-weight: 600;
    }
    
    :global(.document) .bullet-list {
        margin: 15px 0;
        padding-left: 20px;
    }
    
    :global(.document) .bullet-list li {
        margin-bottom: 8px;
        line-height: 1.6;
    }
    
    :global(.document) .formula {
        background: #2c3e50;
        color: #ecf0f1;
        padding: 15px;
        border-radius: 8px;
        font-family: 'Courier New', monospace;
        margin: 15px 0;
        text-align: center;
        font-size: 13px;
    }
    
    :global(.document) .conclusion {
        background: linear-gradient(135deg, #74b9ff 0%, #0984e3 100%);
        color: white;
        padding: 25px;
        border-radius: 12px;
        margin-top: 35px;
    }
    
    :global(.document) .conclusion h2 {
        color: white;
        border: none;
        padding: 0;
        margin-bottom: 15px;
    }
    
    :global(.document) .footer {
        text-align: center;
        margin-top: 40px;
        padding-top: 20px;
        border-top: 1px solid #bdc3c7;
        color: #7f8c8d;
        font-size: 12px;
    }
    
    :global(.document) .reference {
        font-size: 11px;
        color: #7f8c8d;
        vertical-align: super;
    }
    
    @media print {
        :global(.document) { 
            box-shadow: none; 
            margin: 0;
            padding: 20mm;
        }
    }
    
    .print-button {
        position: fixed;
        top: 20px;
        right: 20px;
        background: #3498db;
        color: white;
        border: none;
        padding: 12px 24px;
        border-radius: 25px;
        cursor: pointer;
        font-weight: 600;
        box-shadow: 0 4px 15px rgba(52, 152, 219, 0.3);
        transition: all 0.3s ease;
        z-index: 1000;
    }
</style>

<Layout>
<button class="print-button" on:click={printDocument}>Print Document</button>
    
    <div class="document">
        <div class="header">
            <h1 class="title">How Large Language Models Predict the Next Word</h1>
            <p class="subtitle">Understanding the Mechanisms Behind AI Text Generation</p>
        </div>
        
        <div class="abstract">
            <h3>Abstract</h3>
            <p>Large Language Models (LLMs) have revolutionized how we interact with technology, enabling sophisticated text generation, translation, and question-answering capabilities. At the core of these abilities lies a complex predictive mechanism that allows LLMs to anticipate the most probable next word in a sequence. This document chronologically explains this process, using the example of why an LLM would autocomplete 'THE DOG' with 'BARKS' rather than 'AIRPLANE'. We delve into the foundational concepts and the intricate interplay of various components that enable this seemingly intuitive prediction.</p>
        </div>

        <h1>1. The Foundation: Corpus, Vocabulary, and Tokenization</h1>
        
        <p>The journey of an LLM's prediction begins long before a user types a single word. It starts with the extensive training phase, where the model is exposed to an immense amount of linguistic data.</p>

        <h2>1.1. The Corpus: The Universe of Language</h2>
        
        <div class="concept">
            <div class="concept-title">Key Concept: Corpus</div>
            <p>An LLM's understanding of language is built upon a vast collection of text known as the <span class="highlight">Corpus</span><span class="reference">[1]</span>. This corpus is essentially the entirety of human knowledge expressed in text, gathered from diverse sources such as books, articles, websites, and more. For multimodal LLMs, this can also include images and videos.</p>
        </div>
        
        <p>The primary purpose of the corpus is to provide the raw data from which the LLM learns language patterns, semantics, and relationships. It's the foundational dataset that teaches the model what words exist, how they are used, and in what contexts they typically appear.</p>

        <h2>1.2. Building the Vocabulary: The Dictionary of an LLM</h2>
        
        <p>From this vast corpus, the LLM constructs its <span class="highlight">Dictionary (Vocabulary)</span><span class="reference">[1]</span>. This is a collection of all unique words or sub-word units encountered within the corpus. For instance, a model like GPT-2 might have a dictionary of approximately 52,570 unique English words. This dictionary serves as the complete set of linguistic units the model can recognize and generate.</p>

        <h2>1.3. Tokenization: Breaking Down Language into Processable Units</h2>
        
        <p>Human language, with its myriad words and complex structures, needs to be converted into a numerical format that computers can understand and process. This is where <span class="highlight">Tokens and Tokenization</span> come into play<span class="reference">[1]</span>.</p>
        
        <div class="concept">
            <div class="concept-title">Tokenization Process</div>
            <p><strong>Tokens</strong> are the smallest meaningful segments of language that an LLM can process. A word like "satisfaction" might be broken down into multiple tokens such as "satis," "fac," and "tion." This process aims for efficiency by finding the smallest meaningful units.</p>
            <p><strong>Tokenization</strong> is the mathematical process or algorithm (e.g., Byte Pair Encoding – BPE) that divides the corpus into these tokens.</p>
        </div>
        
        <p>This conversion is crucial as it transforms human language into the numerical representations necessary for computational analysis.</p>

        <h1>2. Representing Meaning: Embeddings and Vectors</h1>
        
        <p>Once language is broken down into tokens, the LLM needs a way to represent the meaning and relationships between these tokens numerically. This is achieved through embeddings and vectors.</p>

        <h2>2.1. Embeddings: Mapping Meaning to Multi-Dimensional Space</h2>
        
        <div class="concept">
            <div class="concept-title">Understanding Embeddings</div>
            <p><span class="highlight">Embeddings</span> are a statistical process that maps tokens into a multi-dimensional (N-dimensional) vector space<span class="reference">[1]</span>. In this space, the conceptual closeness between words or tokens is represented by their proximity.</p>
        </div>
        
        <p>This means that words with similar meanings or that frequently appear in similar contexts will be located closer to each other in this multi-dimensional space. Each dimension in this space can represent a specific concept, such as gender, animacy, size, or abstract qualities.</p>
        
        <div class="example-box">
            <h4>Example</h4>
            <p>The embedding for 'dog' would be closer to 'cat' than to 'airplane' because they share more conceptual similarities.</p>
        </div>

        <h2>2.2. Vectors and Matrices: The Language of LLMs</h2>
        
        <p>Within this embedding space, words and tokens are represented as <span class="highlight">Vectors</span><span class="reference">[1]</span>. These are mathematical entities representing direction and magnitude, essentially 1D matrices. They position words/tokens within the embedding space.</p>
        
        <p>When dealing with collections of vectors or transformations within this multi-dimensional space, <span class="highlight">Matrices</span> are used<span class="reference">[1]</span>. These are rectangular arrays of numbers and can be very large in LLMs, for instance, a 50,000 x 50,000 matrix for a 50,000-word dictionary.</p>

        <h1>3. The Learning Machine: Neural Networks and Training</h1>
        
        <p>The ability of an LLM to predict the next word comes from its training on the vast corpus, a process facilitated by neural networks.</p>

        <h2>3.1. Neural Networks: The Architecture of Learning</h2>
        
        <p>At the heart of an LLM is a <span class="highlight">Neural Network</span>, a complex computational model inspired by the human brain. The fundamental building block of a neural network is the <span class="highlight">Perceptron</span><span class="reference">[1]</span>, which is a single-layer neural network. It takes inputs, applies weights, sums them, and passes the result through an activation function.</p>
        
        <p>More complex neural networks are built using <span class="highlight">Multilayer Perceptrons (MLP)</span><span class="reference">[1]</span>, which are composed of multiple layers of perceptrons. These architectures provide the mechanism for processing information and learning complex patterns within the data.</p>

        <h2>3.2. Neurons, Weights, and Bias: The Building Blocks of Prediction</h2>
        
        <div class="concept">
            <div class="concept-title">Neural Network Components</div>
            <p><strong>Neuron (ML context):</strong> A mathematical function that converts inputs into outputs, using Weights and an Activation Function<span class="reference">[1]</span>.</p>
            <p><strong>Weights:</strong> Numerical values within a neuron (or across layers) that determine the importance or influence of an input. These are the parameters that the LLM learns.</p>
            <p><strong>Bias:</strong> A value added to the weighted sum in a neuron, allowing the activation function to shift, effectively modifying the function's output independently of the inputs<span class="reference">[1]</span>.</p>
        </div>

        <h2>3.3. Activation Functions: Introducing Non-Linearity</h2>
        
        <p><span class="highlight">Activation Functions</span> (e.g., Sigmoid, Softmax) are mathematical functions applied to the output of a neuron's weighted sum<span class="reference">[1]</span>. They introduce non-linearity into the network, allowing it to learn complex patterns that linear models cannot.</p>
        
        <ul class="bullet-list">
            <li><strong>Sigmoid Function:</strong> Maps inputs to a value between 0 and 1, often interpreted as a probability</li>
            <li><strong>Softmax Function:</strong> Typically used for multi-class classification, converting a vector of numbers into a probability distribution where all probabilities sum to 1<span class="reference">[1]</span></li>
        </ul>
        
        <p>The Softmax function is particularly relevant for predicting the next word, as the LLM needs to output probabilities for every word in its vocabulary.</p>

        <h2>3.4. The Learning Process: Forward Pass, Loss, and Backpropagation</h2>
        
        <p>The LLM learns by repeatedly processing data from its training set and adjusting its internal parameters (weights and biases) to minimize prediction errors. This iterative process involves three key steps:</p>

        <h3>3.4.1. Forward Pass: Generating a Prediction</h3>
        
        <p>The <span class="highlight">Forward Pass</span> is the process where input data (e.g., a prompt like "THE DOG") moves through the neural network from the input layer to the output layer, generating a prediction<span class="reference">[1]</span>.</p>
        
        <div class="example-box">
            <h4>Forward Pass Example</h4>
            <p>When "THE DOG" is fed into the LLM, it goes through the layers of neurons, with each neuron performing its weighted sum and activation function. Eventually, the output layer will produce a probability distribution over all the words in its vocabulary, indicating how likely each word is to follow "THE DOG."</p>
        </div>

        <h3>3.4.2. Loss Function: Quantifying Error</h3>
        
        <p>After the forward pass, a <span class="highlight">Loss Function (Cost Function)</span> quantifies the "error" or "distance" between the model's predicted output and the actual (correct) output<span class="reference">[1]</span>. If the LLM predicted "AIRPLANE" with a high probability when the correct next word was "BARKS," the loss function would output a high error value. The ultimate goal of training is to minimize this loss.</p>

        <h3>3.4.3. Backpropagation: Adjusting Weights for Improvement</h3>
        
        <p><span class="highlight">Backpropagation</span> is the process of adjusting the model's weights based on the error calculated by the loss function during the Forward Pass<span class="reference">[1]</span>. It uses calculus (specifically, the chain rule and derivatives) to efficiently determine how each weight contributes to the error and how to modify them to reduce it.</p>
        
        <p>Through many <span class="highlight">Epochs</span> (one complete pass through the entire training dataset)<span class="reference">[1]</span>, the LLM iteratively refines its weights and biases, becoming more accurate in its predictions.</p>

        <h1>4. The Transformer Architecture and Attention Mechanism</h1>
        
        <p>While earlier neural networks could process sequential data, the advent of the Transformer architecture significantly improved LLMs' ability to understand and generate human language, primarily due to the Attention Mechanism.</p>

        <h2>4.1. Transformer: A Leap in Language Processing</h2>
        
        <p>The <span class="highlight">Transformer</span> is an advanced neural network architecture particularly effective for sequential data like language<span class="reference">[1]</span>. It differentiates itself from simpler Multilayer Perceptrons by its ability to process inputs in parallel and effectively capture long-range dependencies within sequences, leading to a deeper contextual understanding.</p>
        
        <p>Transformers often consist of an <span class="highlight">Encoder-Decoder Architecture</span>, where the encoder processes the input sequence and the decoder generates the output sequence, ensuring contextual relevance<span class="reference">[1]</span>.</p>

        <h2>4.2. Attention Mechanism: "Attention is All You Need"</h2>
        
        <div class="concept">
            <div class="concept-title">Attention Mechanism</div>
            <p>The <span class="highlight">Attention Mechanism</span> is a core component of Transformers that allows the model to weigh the importance of different parts of the input sequence when processing a specific element<span class="reference">[1]</span>. It provides "context" to tokens.</p>
        </div>
        
        <p>This is crucial for our example: to predict the next word after "THE DOG," the LLM needs to pay attention to both "THE" and "DOG" and understand their relationship.</p>

        <h3>4.2.1. Query (Q), Key (K), and Value (V): The Components of Attention</h3>
        
        <p>Within the attention mechanism, three key concepts are at play<span class="reference">[1]</span>:</p>
        
        <div class="steps">
            <div class="step">
                <div class="step-number">Q</div>
                <strong>Query (Q):</strong> Represents the current word or token for which the model is trying to find relevant contextual information. It's like asking, "What information is relevant to this word?" In our example, when predicting the word after "DOG," "DOG" would be the Query.
            </div>
            <div class="step">
                <div class="step-number">K</div>
                <strong>Key (K):</strong> Represents all other words in the input sequence, acting as potential answers or information sources to the query. For "DOG," "THE" would be a Key.
            </div>
            <div class="step">
                <div class="step-number">V</div>
                <strong>Value (V):</strong> The actual information (semantic features, characteristics) associated with each word that will be weighted and combined based on the attention scores. The Value for "THE" would contain its grammatical role and its association with nouns.
            </div>
        </div>

        <h3>4.2.2. Self-Attention: Understanding Internal Relationships</h3>
        
        <p><span class="highlight">Self-Attention</span> is a mechanism where the attention is applied within the same input sequence, allowing each word to relate to every other word in the sequence to understand its context<span class="reference">[1]</span>.</p>
        
        <p>This means that when the LLM processes "DOG," it doesn't just look at "THE" in isolation; it considers how "DOG" relates to "THE" and any other words that might precede it. This allows the model to build a rich contextual representation of each word in the input.</p>

        <h1>5. Predicting the Next Word: Why "BARKS" and Not "AIRPLANE"</h1>
        
        <p>Now, let's bring all these concepts together to understand why an LLM predicts "BARKS" after "THE DOG" instead of "AIRPLANE."</p>
        
        <p>When the LLM receives the input "THE DOG," the following steps occur:</p>
        
        <div class="steps">
            <div class="step">
                <div class="step-number">1</div>
                <strong>Tokenization and Embeddings:</strong> "THE" and "DOG" are tokenized, and their corresponding embeddings are retrieved. These embeddings place "DOG" in a region of the multi-dimensional space that is conceptually close to other animals and far from inanimate objects like "AIRPLANE."
            </div>
            
            <div class="step">
                <div class="step-number">2</div>
                <strong>Transformer Processing with Attention:</strong> The Transformer architecture processes these embeddings. The self-attention mechanism allows the model to understand the relationship between "THE" and "DOG." It recognizes that "DOG" is an animal and that "THE" is an article preceding a noun.
            </div>
            
            <div class="step">
                <div class="step-number">3</div>
                <strong>Contextual Understanding:</strong> Through its extensive training on the corpus, the LLM has learned that dogs are frequently associated with actions like "BARKS," "RUNS," "EATS," etc. This association is encoded in the weights and biases of its neural network. The attention mechanism ensures that the model focuses on the relevant aspects of "DOG" (its animacy, its typical behaviors) when predicting the next word.
            </div>
            
            <div class="step">
                <div class="step-number">4</div>
                <strong>Probability Distribution:</strong> The LLM's output layer, using a Softmax activation function, generates a probability distribution over its entire vocabulary for the next word. Due to the learned associations and contextual understanding:
                <ul class="bullet-list">
                    <li>Words like "BARKS," "RUNS," and "EATS" will have significantly higher probabilities because they are common actions performed by dogs.</li>
                    <li>Words like "AIRPLANE" will have extremely low probabilities because there is no learned association or contextual relevance between "DOG" and "AIRPLANE" in the vast majority of the training data.</li>
                </ul>
            </div>
            
            <div class="step">
                <div class="step-number">5</div>
                <strong>Selection:</strong> The LLM then selects the word with the highest probability as its prediction. In this case, "BARKS" would have a much higher probability than "AIRPLANE," leading to its selection as the autocomplete suggestion.
            </div>
        </div>
        
        <div class="example-box">
            <h4>Key Insight</h4>
            <p>In essence, the LLM's prediction is a statistical inference based on the patterns and relationships it has learned from billions of words during its training. It's not about true understanding in a human sense, but rather a highly sophisticated pattern recognition system that leverages the statistical regularities of language.</p>
        </div>

        <div class="conclusion">
            <h2>Conclusion</h2>
            <p>The ability of a Large Language Model to predict the next word, seemingly with an understanding of context and meaning, is a testament to the power of its underlying architecture and the vastness of its training data. From the initial tokenization and embedding of words into a multi-dimensional space to the intricate workings of the Transformer's attention mechanism and the iterative refinement through backpropagation, every step contributes to the LLM's capacity to generate coherent and contextually relevant text.</p>
            
            <p>The example of predicting "BARKS" over "AIRPLANE" after "THE DOG" beautifully illustrates how these components work in concert, allowing LLMs to mimic human linguistic intelligence with remarkable accuracy.</p>
        </div>
        
        <div class="footer">
            <p>Document generated using advanced language model technology</p>
            <p>For more information on AI and machine learning concepts, consult current academic literature and research papers</p>
        </div>
    </div>
</Layout>
