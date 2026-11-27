/*
 * All visible text, DE + EN. Keys are referenced from index.html via
 * data-i18n="path.to.key" (plain text) or data-i18n-html (trusted inline markup
 * from this file only: <b>, <i>, <code>, <sub>).
 */
window.AIX = window.AIX || {};
window.AIX.content = {
  de: {
    ui: {
      back: "← Lernhub", brand: "Wie KI denkt", lang: "Sprache",
      motionOn: "Animation: an", motionOff: "Animation: aus",
      chapters: "Kapitel", scroll: "Scrollen",
      noscript: "Diese Seite braucht JavaScript für ihre Animationen.",
    },
    chapters: ["Start", "Harness", "Werkzeuge", "LLM", "Tokens", "Embeddings", "Schichten", "Attention", "Softmax", "Schleife"],
    prompt: "Wie wird das Wetter morgen in Bremen?",
    intro: {
      kicker: "Eine Reise ins Innere eines Sprachmodells",
      title: "Was passiert, wenn du Enter drückst?",
      steps: [
        "Du tippst eine Frage, zwei Sekunden später steht eine Antwort da. Dazwischen arbeiten ein Programm, ein Werkzeug, Milliarden gelernter Zahlen und eine Wahrscheinlichkeitsrechnung pro Wort.",
        "Wir folgen dieser einen Frage auf ihrem Weg nach innen. <b>Scroll weiter</b>, wir fliegen hinein.",
      ],
      app: "Chat", input: "Nachricht schreiben …",
    },
    harness: {
      kicker: "01 · Harness",
      title: "Das Programm um das Modell",
      steps: [
        "Das Sprachmodell sieht nie ein Chatfenster. Es bekommt nur Text. Die App drumherum heißt <b>Harness</b>: sie baut aus allem Wichtigen einen einzigen langen Text, den <b>Kontext</b>.",
        "Hinein kommen ein <b>System-Prompt</b> (Rolle und Regeln), die <b>Beschreibungen der Werkzeuge</b>, der bisherige <b>Chatverlauf</b> und deine neue Nachricht.",
        "Das Modell hat kein Gedächtnis zwischen zwei Aufrufen. Der Harness schickt bei jedem Schritt den ganzen Verlauf neu mit. Der Platz ist begrenzt: das <b>Kontextfenster</b>, bei aktuellen Modellen etwa 100 000 bis 1 000 000 Tokens.",
      ],
      ctx: "Kontextfenster", sysH: "System",
      sys: "Du bist ein hilfreicher Assistent. Antworte kurz. Heute: 2026-11-27.",
      toolsH: "Werkzeuge", tools: "Liefert die Vorhersage für Ort und Datum.",
      histH: "Verlauf", hist: "Du: Hallo!<br>KI: Hallo, wie kann ich helfen?",
      userH: "Neue Nachricht", out: "an das Modell",
    },
    tools: {
      kicker: "02 · Werkzeuge",
      title: "Wenn Wissen nicht reicht",
      steps: [
        "Das Wetter von morgen steht in keinen Trainingsdaten. Das Modell hat aber gelernt, in so einem Fall ein Werkzeug anzufordern. Dazu schreibt es einen strukturierten <b>Tool-Aufruf</b>.",
        "Das Modell führt selbst nichts aus. Der <b>Harness</b> liest den Aufruf, fragt die Wetter-API und hängt das Ergebnis als neuen Text an den Kontext.",
        "Dann läuft das Modell erneut, jetzt mit den Messwerten im Kontext. Diese Schleife (nachdenken, Werkzeug nutzen, Ergebnis lesen, weiter) ist der Kern jedes <b>KI-Agenten</b>.",
      ],
      harness: "Harness", llm: "LLM", api: "Wetter-API",
      ctx: "Kontext", call: "Tool-Aufruf", result: "Ergebnis", answer: "Antwort",
    },
    llm: {
      kicker: "03 · Das Sprachmodell",
      title: "Eine einzige große Funktion",
      steps: [
        "Jetzt öffnen wir die Kiste. Ein großes Sprachmodell (<b>LLM</b>) ist eine mathematische Funktion: Tokens hinein, eine Wahrscheinlichkeit für jedes mögliche <b>nächste Token</b> heraus.",
        "Die Funktion hat Milliarden einstellbare Zahlen, die <b>Parameter</b>. Im Training wurden sie immer wieder nachjustiert, bis das Modell bei riesigen Textmengen gut vorhersagen konnte, wie ein Text weitergeht.",
        "Eine Antwort entsteht Token für Token: vorhersagen, eines auswählen, anhängen, von vorn. Wir verfolgen jetzt genau einen dieser Schritte.",
      ],
      in: "Tokens hinein", out: "P(nächstes Token)", params: "Milliarden Parameter",
      context: "Morgen wird es in Bremen",
    },
    tokens: {
      kicker: "04 · Tokens",
      title: "Text wird zu Nummern",
      steps: [
        "Zuerst zerlegt ein <b>Tokenizer</b> den Text in Stücke. Häufige Wörter bleiben ganz, das Leerzeichen hängt meist vorne am nächsten Token (hier als ␣).",
        "Jedes Token ist nur eine Nummer in einem festen Vokabular mit typisch 50 000 bis 200 000 Einträgen. Das Modell sieht nie Buchstaben, nur diese Nummern.",
        "Seltene Wörter werden in Teile zerschnitten. Deutsche Texte brauchen meist mehr Tokens pro Wort als englische. Die Nummern hier sind zur Veranschaulichung ausgedacht.",
      ],
      rare: "Seltenes Wort:",
    },
    embed: {
      kicker: "05 · Embeddings",
      title: "Nummern bekommen Bedeutung",
      steps: [
        "Eine Nummer allein sagt nichts über Bedeutung. Also schlägt das Modell für jedes Token eine Zeile in einer riesigen Tabelle nach: den <b>Embedding-Vektor</b>, eine Liste aus tausenden Zahlen.",
        "Diese Vektoren sind Koordinaten in einem <b>Bedeutungsraum</b>. Wörter aus ähnlichen Zusammenhängen liegen nah beieinander: Regen bei Schnee, Bremen bei Hamburg.",
        "Echte Räume haben tausende Dimensionen (GPT-3: 12 288). Du siehst eine 3D-Skizze mit ausgedachten Punkten. <b>Zieh am Raum</b>, um ihn zu drehen. Zusätzlich fließt die Position jedes Tokens ein, sonst wäre „Hund beißt Mann“ dasselbe wie „Mann beißt Hund“.",
      ],
      table: "Embedding-Tabelle", rows: "Vokabular × d", more: "weitere Zahlen",
      hint: "⟲ ziehen zum Drehen",
      groups: { weather: "Wetter", city: "Städte", time: "Zeit", animal: "Tiere" },
    },
    layers: {
      kicker: "06 · Transformer",
      title: "Durch den Schichtenstapel",
      steps: [
        "Jetzt fliegen alle Vektoren gemeinsam durch einen Stapel gleich gebauter <b>Schichten</b>. GPT-3 hatte 96 davon. Bei aktuellen Modellen sind solche Zahlen meist nicht veröffentlicht.",
        "Jede Schicht hat zwei Teile. In der <b>Attention</b> tauschen die Tokens Informationen untereinander aus. Danach verarbeitet ein <b>Feed-Forward-Netz</b> (MLP) jedes Token für sich weiter.",
        "Jede Schicht addiert nur eine Korrektur auf den Vektor (der <b>Residual-Stream</b>). So sammelt etwa der Vektor von „Bremen“ Schicht für Schicht Kontext ein: Stadt, Norddeutschland, Ort einer Wetterfrage.",
      ],
      layer: "Schicht", attn: "Attention", mlp: "MLP",
    },
    attention: {
      kicker: "07 · Attention",
      title: "Wer schaut auf wen?",
      steps: [
        "Jedes Token stellt eine Frage (<b>Query</b>) und bietet ein Etikett (<b>Key</b>) und einen Inhalt (<b>Value</b>) an. Je besser eine Query zu einem Key passt, desto mehr Inhalt fließt von dort herüber.",
        "Die Matrix zeigt pro Zeile (wer fragt), wie stark sie auf jede Spalte (wen sie anschaut) achtet. Softmax bringt jede Zeile auf die Summe 1. Oben rechts bleibt alles leer: kein Token darf in die Zukunft schauen.",
        "Modelle haben viele solcher <b>Köpfe</b> pro Schicht, jeder achtet auf etwas anderes. Wähle einen Kopf und tippe auf ein Token. Die Rohwerte sind ausgedacht, die Softmax wird live berechnet.",
      ],
      heads: ["Kopf A · vorheriges Token", "Kopf B · Ort & Zeit", "Kopf C · Satzanfang"],
      rowsLabel: "fragt (Query)", colsLabel: "wird angeschaut (Key)",
      pick: "Token wählen",
    },
    softmax: {
      kicker: "08 · Softmax",
      title: "Vom Vektor zur Wahrscheinlichkeit",
      steps: [
        "Nach der letzten Schicht wird der Vektor des letzten Tokens mit jedem Eintrag des Vokabulars verglichen. Heraus kommt pro Kandidat eine rohe Zahl, ein <b>Logit</b>.",
        "<b>Softmax</b> macht daraus Wahrscheinlichkeiten: jeden Wert exponentieren, durch die Summe teilen. Große Logits gewinnen überproportional, zusammen ergeben alle 100 %.",
        "Die <b>Temperatur</b> T macht die Verteilung spitzer oder flacher. Niedrig: fast immer das Top-Token. Hoch: abwechslungsreicher, aber fehleranfälliger. Probier es und lass das Modell ziehen.",
      ],
      prefix: "Morgen wird es in Bremen",
      logits: "Logit z", probs: "Wahrscheinlichkeit p",
      temp: "Temperatur", sample: "Token ziehen", reset: "Zurücksetzen",
      drawn: "Gezogen:", none: "noch nichts",
      note: "Gezeigt sind 8 Kandidaten. Im echten Modell läuft die Softmax über das ganze Vokabular.",
    },
    loop: {
      kicker: "09 · Schleife",
      title: "Und wieder von vorn",
      steps: [
        "Das gezogene Token wird angehängt, und alles beginnt erneut: Tokens, Embeddings, alle Schichten, Softmax. Für jedes einzelne Token der Antwort.",
        "Drei Schleifen stecken ineinander: die <b>Token-Schleife</b> im Modell, die <b>Werkzeug-Schleife</b> im Harness und die <b>Gesprächsschleife</b> mit dir.",
        "Nach ein paar Dutzend Durchläufen steht die Antwort da. Kein Nachschlagen in einer Datenbank, sondern Vorhersage, Token für Token, gestützt auf den Kontext.",
      ],
      rings: ["Token-Schleife", "Werkzeug-Schleife", "Gesprächsschleife"],
      answer: "Morgen wird es in Bremen regnerisch und windig: etwa 6 mm Regen, Wind um 11 m/s, höchstens 7 °C.",
      again: "Nochmal von vorn", sources: "Quellen & weiterlesen",
      src: [
        "Vaswani et al. (2017): Attention Is All You Need. arXiv:1706.03762",
        "Brown et al. (2020): Language Models are Few-Shot Learners (GPT-3). arXiv:2005.14165",
        "Jay Alammar: The Illustrated Transformer (jalammar.github.io)",
        "3Blue1Brown: Neural Networks, Kapitel 5–7 (Transformer, Attention)",
      ],
      disclaimer: "Token-Nummern, Vektoren, Attention-Rohwerte und Logits auf dieser Seite sind zur Veranschaulichung ausgedacht. Die Rechenwege (Softmax, Maske, Temperatur) sind echt.",
    },
  },

  en: {
    ui: {
      back: "← Lernhub", brand: "How AI thinks", lang: "Language",
      motionOn: "Animation: on", motionOff: "Animation: off",
      chapters: "Chapters", scroll: "Scroll",
      noscript: "This page needs JavaScript for its animations.",
    },
    chapters: ["Start", "Harness", "Tools", "LLM", "Tokens", "Embeddings", "Layers", "Attention", "Softmax", "Loop"],
    prompt: "What will the weather be like in Bremen tomorrow?",
    intro: {
      kicker: "A journey inside a language model",
      title: "What happens when you press Enter?",
      steps: [
        "You type a question and two seconds later an answer appears. In between: a program, a tool, billions of learned numbers and one probability calculation per word.",
        "We follow this one question on its way inside. <b>Keep scrolling</b>, we are flying in.",
      ],
      app: "Chat", input: "Write a message …",
    },
    harness: {
      kicker: "01 · Harness",
      title: "The program around the model",
      steps: [
        "The language model never sees a chat window. It only receives text. The app around it is called the <b>harness</b>: it assembles everything that matters into one long text, the <b>context</b>.",
        "In go a <b>system prompt</b> (role and rules), the <b>tool descriptions</b>, the <b>chat history</b> so far and your new message.",
        "The model has no memory between calls. The harness resends the whole history at every step. Space is limited: the <b>context window</b>, roughly 100,000 to 1,000,000 tokens for current models.",
      ],
      ctx: "Context window", sysH: "System",
      sys: "You are a helpful assistant. Answer briefly. Today: 2026-11-27.",
      toolsH: "Tools", tools: "Returns the forecast for a place and date.",
      histH: "History", hist: "You: Hi!<br>AI: Hi, how can I help?",
      userH: "New message", out: "to the model",
    },
    tools: {
      kicker: "02 · Tools",
      title: "When knowledge is not enough",
      steps: [
        "Tomorrow's weather is in no training data. But the model has learned to request a tool in such cases. It writes a structured <b>tool call</b>.",
        "The model executes nothing itself. The <b>harness</b> reads the call, queries the weather API and appends the result to the context as new text.",
        "Then the model runs again, now with the measurements in its context. This loop (think, use a tool, read the result, continue) is the core of every <b>AI agent</b>.",
      ],
      harness: "Harness", llm: "LLM", api: "Weather API",
      ctx: "Context", call: "Tool call", result: "Result", answer: "Answer",
    },
    llm: {
      kicker: "03 · The language model",
      title: "One single, huge function",
      steps: [
        "Now we open the box. A large language model (<b>LLM</b>) is a mathematical function: tokens in, a probability for every possible <b>next token</b> out.",
        "The function has billions of adjustable numbers, the <b>parameters</b>. During training they were nudged again and again until the model predicted well how huge amounts of text continue.",
        "An answer is produced token by token: predict, pick one, append, repeat. We now follow exactly one of these steps.",
      ],
      in: "Tokens in", out: "P(next token)", params: "billions of parameters",
      context: "Tomorrow, Bremen will be",
    },
    tokens: {
      kicker: "04 · Tokens",
      title: "Text becomes numbers",
      steps: [
        "First a <b>tokenizer</b> cuts the text into pieces. Common words stay whole, and the space usually sticks to the front of the next token (shown as ␣).",
        "Each token is just a number in a fixed vocabulary of typically 50,000 to 200,000 entries. The model never sees letters, only these numbers.",
        "Rare words are cut into parts. As a rule of thumb, English averages about 4 characters per token. The numbers here are made up for illustration.",
      ],
      rare: "Rare word:",
    },
    embed: {
      kicker: "05 · Embeddings",
      title: "Numbers gain meaning",
      steps: [
        "A number alone says nothing about meaning. So for each token the model looks up a row in a huge table: the <b>embedding vector</b>, a list of thousands of numbers.",
        "These vectors are coordinates in a <b>space of meaning</b>. Words from similar contexts end up close together: rain near snow, Bremen near Hamburg.",
        "Real spaces have thousands of dimensions (GPT-3: 12,288). You see a 3D sketch with made-up points. <b>Drag the space</b> to rotate it. The position of each token is added in as well, otherwise “dog bites man” would equal “man bites dog”.",
      ],
      table: "Embedding table", rows: "vocabulary × d", more: "more numbers",
      hint: "⟲ drag to rotate",
      groups: { weather: "Weather", city: "Cities", time: "Time", animal: "Animals" },
    },
    layers: {
      kicker: "06 · Transformer",
      title: "Through the stack of layers",
      steps: [
        "Now all vectors fly together through a stack of identical <b>layers</b>. GPT-3 had 96 of them. For current models such numbers are mostly not published.",
        "Each layer has two parts. In <b>attention</b> the tokens exchange information with each other. Then a <b>feed-forward network</b> (MLP) processes each token on its own.",
        "Each layer only adds a correction to the vector (the <b>residual stream</b>). Layer by layer, the vector for “Bremen” collects context: a city, northern Germany, the place in a weather question.",
      ],
      layer: "Layer", attn: "Attention", mlp: "MLP",
    },
    attention: {
      kicker: "07 · Attention",
      title: "Who looks at whom?",
      steps: [
        "Each token asks a question (<b>query</b>) and offers a label (<b>key</b>) and content (<b>value</b>). The better a query matches a key, the more content flows over from there.",
        "The matrix shows for each row (who asks) how much it attends to each column (who is looked at). Softmax makes every row sum to 1. The upper right stays empty: no token may look into the future.",
        "Models have many such <b>heads</b> per layer, each attending to something different. Pick a head and tap a token. The raw scores are made up, the softmax is computed live.",
      ],
      heads: ["Head A · previous token", "Head B · place & time", "Head C · sentence start"],
      rowsLabel: "asks (query)", colsLabel: "is looked at (key)",
      pick: "Pick a token",
    },
    softmax: {
      kicker: "08 · Softmax",
      title: "From vector to probability",
      steps: [
        "After the last layer, the vector of the last token is compared with every entry in the vocabulary. The result is one raw number per candidate, a <b>logit</b>.",
        "<b>Softmax</b> turns these into probabilities: exponentiate each value, divide by the sum. Large logits win disproportionately, and everything adds up to 100 %.",
        "The <b>temperature</b> T makes the distribution sharper or flatter. Low: almost always the top token. High: more varied, but more error-prone. Try it and let the model draw.",
      ],
      prefix: "Tomorrow, Bremen will be",
      logits: "Logit z", probs: "Probability p",
      temp: "Temperature", sample: "Draw a token", reset: "Reset",
      drawn: "Drawn:", none: "nothing yet",
      note: "8 candidates are shown. In a real model the softmax runs over the whole vocabulary.",
    },
    loop: {
      kicker: "09 · Loop",
      title: "And around again",
      steps: [
        "The drawn token is appended and everything starts over: tokens, embeddings, all layers, softmax. For every single token of the answer.",
        "Three loops are nested: the <b>token loop</b> inside the model, the <b>tool loop</b> in the harness and the <b>conversation loop</b> with you.",
        "After a few dozen rounds the answer is complete. No database lookup, but prediction, token by token, grounded in the context.",
      ],
      rings: ["Token loop", "Tool loop", "Conversation loop"],
      answer: "Tomorrow, Bremen will be rainy and windy: about 6 mm of rain, wind around 11 m/s, a high of 7 °C.",
      again: "Start over", sources: "Sources & further reading",
      src: [
        "Vaswani et al. (2017): Attention Is All You Need. arXiv:1706.03762",
        "Brown et al. (2020): Language Models are Few-Shot Learners (GPT-3). arXiv:2005.14165",
        "Jay Alammar: The Illustrated Transformer (jalammar.github.io)",
        "3Blue1Brown: Neural Networks, chapters 5–7 (transformers, attention)",
      ],
      disclaimer: "Token IDs, vectors, raw attention scores and logits on this page are made up for illustration. The computations (softmax, mask, temperature) are real.",
    },
  },
};
