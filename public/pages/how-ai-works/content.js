/*
 * All visible text, DE + EN. Keys are referenced from index.html via
 * data-i18n="path.to.key" (plain text) or data-i18n-html (trusted inline markup
 * from this file only: <b>, <i>, <code>, <sub>), and data-steps="station.steps".
 */
window.AIX = window.AIX || {};
window.AIX.content = {
  de: {
    ui: {
      back: "← Lernhub", brand: "Wie KI denkt", lang: "Sprache",
      motionOn: "Animation: an", motionOff: "Animation: aus",
      chapters: "Kapitel", scroll: "Scrollen oder wischen: vorwärts fliegen",
    },
    chapters: ["Frage", "LLM", "Tokens", "Embeddings", "Bedeutungsraum", "Attention", "Schichten", "Softmax", "Zeitraffer", "Antwort"],
    prompt: "Könnte ein Eisbär einen Pinguin fressen, wenn er in der Antarktis leben würde?",
    answer: "Ja, theoretisch schon: Eisbären sind große Raubtiere, ein Pinguin wäre leichte Beute. In Wirklichkeit begegnen sie sich aber nie: Eisbären leben in der Arktis, Pinguine fast nur auf der Südhalbkugel.",
    intro: {
      kicker: "Eine Reise ins Innere eines Sprachmodells",
      title: "Was passiert, wenn du Enter drückst?",
      steps: [
        "Jemand tippt eine Frage. Sekunden später steht die Antwort da. Wir fliegen der Frage hinterher und schauen, was dazwischen passiert.",
        "Zuerst packt die App, der <b>Harness</b>, die Frage mit einem <b>System-Prompt</b> (Rolle und Regeln) und dem bisherigen Chat zu einem langen Text zusammen. Nur diesen Text bekommt das Modell zu sehen.",
      ],
      app: "Chat", input: "Nachricht schreiben …",
      sys: "System: Du bist ein hilfreicher Assistent. Antworte kurz und sachlich.",
    },
    llm: {
      kicker: "01 · Das Sprachmodell",
      title: "Hinein in die Kiste",
      steps: [
        "Da steht es: das große Sprachmodell (<b>LLM</b>). Im Kern eine einzige riesige Funktion mit Milliarden gelernter Zahlen, den <b>Parametern</b>.",
        "Es kann genau eine Sache: Text hinein, eine Wahrscheinlichkeit für das <b>nächste Wort</b> heraus. Die Antwort entsteht Wort für Wort. Wir fliegen hinein.",
      ],
      params: "Milliarden Parameter",
    },
    tokens: {
      kicker: "02 · Tokens",
      title: "Text wird zu Nummern",
      steps: [
        "Drinnen wird der Text zuerst in <b>Tokens</b> zerlegt. Häufige Wörter bleiben ganz, seltene wie „Antarktis“ werden in Stücke geschnitten. Das Leerzeichen hängt meist vorne am nächsten Token (␣).",
        "Jedes Token ist eine Nummer in einem festen Vokabular mit 50 000 bis 200 000 Einträgen. Ab jetzt rechnet das Modell nur noch mit diesen Nummern.",
        "Unsere Frage wird so zu 18 Nummern. Die Nummern hier sind zur Veranschaulichung ausgedacht, jedes echte Modell hat seinen eigenen Tokenizer.",
      ],
    },
    embed: {
      kicker: "03 · Embeddings",
      title: "Nummern bekommen Bedeutung",
      steps: [
        "Jede Token-Nummer ist eine Zeilennummer. Das Modell blättert in einer riesigen Tabelle, der <b>Embedding-Matrix</b>, zu dieser Zeile und liest sie aus.",
        "Jede Zeile ist ein <b>Vektor</b>: eine Liste aus tausenden Zahlen (GPT-3: 12 288). Am Ende hat jedes Token seinen Vektor, die Frage ist jetzt eine Matrix aus 18 × 12 288 Zahlen.",
        "Diese Zahlen wurden nicht programmiert, sondern im <b>Training</b> gelernt: so lange verschoben, bis Wörter mit ähnlicher Verwendung ähnliche Vektoren hatten.",
      ],
      table: "Embedding-Matrix", rows: "Vokabular × d", stack: "Vektoren deiner Frage", more: "weitere",
    },
    space: {
      kicker: "04 · Bedeutungsraum",
      title: "Nah dran heißt ähnlich",
      steps: [
        "<b>Was ist ein Vektor?</b> Eine Liste von Zahlen, die man als Koordinaten lesen kann: 2 Zahlen sind ein Punkt auf einer Fläche, 3 ein Punkt im Raum, 12 288 ein Punkt in einem Raum mit 12 288 Richtungen. In diesem <b>Bedeutungsraum</b> liegen Wörter aus ähnlichen Zusammenhängen nah beieinander.",
        "„Eisbär“ liegt bei den Tieren, aber auch nah an Arktis und Eis. „Pinguin“ liegt nah an der Antarktis. Genau dieses Wissen nutzt das Modell gleich.",
        "Echte Räume haben tausende Dimensionen, hier siehst du eine 3D-Skizze mit ausgedachten Punkten. <b>Zieh am Raum</b>, um ihn zu drehen.",
      ],
      hint: "⟲ ziehen zum Drehen",
      groups: { animal: "Tiere", place: "Orte", cold: "Kälte", verb: "Tätigkeiten" },
    },
    attention: {
      kicker: "",
      title: "Attention – wer ist „er“?",
      steps: [
        "Damit ein Wort seinen Sinn bekommt, schaut es auf die Wörter davor. Für „er“ heißt die Frage: Wer ist gemeint? Je heller ein Wort leuchtet, desto mehr Aufmerksamkeit (<b>Attention</b>) bekommt es. Gut die Hälfte geht an „Eisbär“.",
        "Das passiert für jedes Wort gleichzeitig. Zusammen ergibt das eine Tabelle, die <b>Attention-Matrix</b>: Jede Zeile ist ein Wort, das schaut, und ergibt zusammen 100 %. Oben rechts bleibt alles leer, denn kein Wort darf in die Zukunft schauen.",
        "Warum „Eisbär“? Pinguine leben schon in der Antarktis, also passt nur der Eisbär. Ein Modell schaut aus vielen Blickwinkeln gleichzeitig, sogenannten <b>Köpfen</b>. Probier oben die drei Köpfe aus und tippe auf andere Wörter.",
      ],
      headsLabel: "Attention-Köpfe:",
      heads: ["1 · Nachbarwort", "2 · Wer ist gemeint?", "3 · Satzanfang"],
      who: "„{w}“ schaut auf:", future: "Zukunft: nicht sichtbar", pick: "Wort wählen",
      axis: "Zeile = Wort, das schaut · Spalte = Wort, das angeschaut wird · Werte in %",
      note: "Fachbegriffe: Jedes Wort sendet eine Frage (Query) und bietet ein Etikett (Key) und einen Inhalt (Value) an. Hier ganze Wörter statt Tokens, Rohwerte ausgedacht, Softmax live berechnet.",
    },
    layers: {
      kicker: "",
      title: "96 Transformer-Schichten",
      steps: [
        "Attention ist nur die Hälfte einer <b>Transformer-Schicht</b>. Danach verarbeitet ein <b>Feed-Forward-Netz</b> (MLP) jeden Vektor für sich weiter. Dort steckt vermutlich viel gelerntes Faktenwissen.",
        "Stell dir jede Schicht wie ein <b>Sieb</b> vor: Der Vektor fällt hindurch und kommt leicht verändert heraus, denn jede Schicht addiert nur eine kleine Korrektur (<b>Residual-Stream</b>). Unten siehst du, wie sich das Zahlenmuster von Schicht zu Schicht verschiebt.",
        "Warum 96? Das ist die Zahl, die die Entwickler von GPT-3 gewählt haben. Grob gesagt erkennen frühe Schichten eher Wortteile und Grammatik, mittlere Bedeutungen und Bezüge, späte bereiten das nächste Wort vor. Mehr Schichten können mehr, kosten aber mehr Rechenzeit.",
      ],
      layer: "Schicht", attn: "Attention", mlp: "MLP", vecLabel: "Vektor von „?“ nach Schicht",
    },
    softmax: {
      kicker: "07 · Softmax",
      title: "Welches Wort kommt jetzt?",
      steps: [
        "Nach der letzten Schicht hat jedes Token einen neuen Vektor. Für das nächste Wort zählt nur der <b>letzte</b>, der beim „?“. Über Attention hat er das Wichtige aus allen anderen eingesammelt.",
        "Dieser Vektor wird mit jedem Wort des Vokabulars verglichen: pro Kandidat eine rohe Zahl, ein <b>Logit</b>. <b>Softmax</b> macht daraus Wahrscheinlichkeiten: exponentieren, durch die Summe teilen, zusammen 100 %.",
        "Die <b>Temperatur</b> T macht die Verteilung spitzer oder flacher. Dann wird ein Wort gezogen. Probier es aus.",
        "Das gezogene Wort wird angehängt. Die Tabelle hat jetzt eine Zeile mehr, und mit ihr beginnt die nächste Runde durch alle Schichten.",
      ],
      vectors: "Vektoren nach Schicht 96", last: "nur dieser zählt", added: "neu angehängt", unembed: "× Vokabular-Matrix → Logits",
      prefix: "Antwort:", logits: "Logit z", probs: "Wahrscheinlichkeit p",
      temp: "Temperatur", sample: "Wort ziehen", reset: "Zurücksetzen",
      drawn: "Gezogen:", none: "noch nichts",
      note: "8 Kandidaten gezeigt. Im echten Modell läuft die Softmax über das ganze Vokabular.",
    },
    loop: {
      kicker: "08 · Zeitraffer",
      title: "Wort für Wort",
      steps: [
        "So geht es weiter: Für jedes neue Wort läuft alles noch einmal, Tokens, Embeddings, 96 Schichten, Softmax.",
        "Im Zeitraffer: Durchlauf für Durchlauf wächst die Antwort unten mit. Für jedes Wort rechnet das Modell einmal durch das ganze Netz.",
        "Bis ein Ende-Token gezogen wird. Dann ist die Antwort fertig, und wir fliegen wieder hinaus.",
      ],
      stages: ["Tokens", "Vektoren", "96 Schichten", "Softmax"],
      answerLabel: "Antwort",
    },
    outro: {
      kicker: "09 · Antwort",
      title: "Zurück im Chat",
      steps: [
        "Draußen erscheint die fertige Antwort. Kein Nachschlagen in einer Datenbank, sondern Vorhersage, Wort für Wort, aus gelernten Mustern.",
        "Drei Schleifen stecken ineinander: die <b>Token-Schleife</b> im Modell, die <b>Gesprächsschleife</b> mit dir und bei Bedarf eine <b>Werkzeug-Schleife</b>. Für das Wetter von morgen würde das Modell einen Tool-Aufruf schreiben, den der Harness ausführt.",
      ],
      again: "Nochmal von vorn", sources: "Quellen & weiterlesen",
      src: [
        "Vaswani et al. (2017): Attention Is All You Need. arXiv:1706.03762",
        "Brown et al. (2020): Language Models are Few-Shot Learners (GPT-3). arXiv:2005.14165",
        "Geva et al. (2021): Transformer Feed-Forward Layers Are Key-Value Memories. arXiv:2012.14913",
        "Jay Alammar: The Illustrated Transformer (jalammar.github.io)",
        "3Blue1Brown: Neural Networks, Kapitel 5–7 (Transformer, Attention)",
      ],
      disclaimer: "Token-Nummern, Vektoren, Attention-Rohwerte und Logits auf dieser Seite sind zur Veranschaulichung ausgedacht. Die Rechenwege (Softmax, Maske, Temperatur, Ziehen) sind echt.",
    },
  },

  en: {
    ui: {
      back: "← Lernhub", brand: "How AI thinks", lang: "Language",
      motionOn: "Animation: on", motionOff: "Animation: off",
      chapters: "Chapters", scroll: "Scroll or swipe: fly forward",
    },
    chapters: ["Question", "LLM", "Tokens", "Embeddings", "Meaning space", "Attention", "Layers", "Softmax", "Fast forward", "Answer"],
    prompt: "Could a polar bear eat a penguin if it lived on Antarctica?",
    answer: "Yes, in theory: polar bears are big predators and a penguin would be easy prey. In reality they never meet: polar bears live in the Arctic, penguins almost only in the Southern Hemisphere.",
    intro: {
      kicker: "A journey inside a language model",
      title: "What happens when you press Enter?",
      steps: [
        "Someone types a question. Seconds later the answer appears. We follow the question and look at what happens in between.",
        "First the app, the <b>harness</b>, wraps the question together with a <b>system prompt</b> (role and rules) and the chat so far into one long text. That text is all the model gets to see.",
      ],
      app: "Chat", input: "Write a message …",
      sys: "System: You are a helpful assistant. Answer briefly and factually.",
    },
    llm: {
      kicker: "01 · The language model",
      title: "Into the box",
      steps: [
        "There it is: the large language model (<b>LLM</b>). At its core a single huge function with billions of learned numbers, the <b>parameters</b>.",
        "It does exactly one thing: text in, a probability for the <b>next word</b> out. The answer is built word by word. We are flying in.",
      ],
      params: "billions of parameters",
    },
    tokens: {
      kicker: "02 · Tokens",
      title: "Text becomes numbers",
      steps: [
        "Inside, the text is first cut into <b>tokens</b>. Common words stay whole, rare ones like “Antarctica” are cut into pieces. The space usually sticks to the front of the next token (␣).",
        "Each token is a number in a fixed vocabulary of 50,000 to 200,000 entries. From now on the model only computes with these numbers.",
        "Our question becomes 14 numbers. The numbers here are made up for illustration; every real model has its own tokenizer.",
      ],
    },
    embed: {
      kicker: "03 · Embeddings",
      title: "Numbers gain meaning",
      steps: [
        "Each token number is a row number. The model flips through a huge table, the <b>embedding matrix</b>, to that row and reads it out.",
        "Each row is a <b>vector</b>: a list of thousands of numbers (GPT-3: 12,288). In the end every token has its vector; the question is now a matrix of 14 × 12,288 numbers.",
        "These numbers were not programmed but learned in <b>training</b>: shifted again and again until words used in similar ways had similar vectors.",
      ],
      table: "Embedding matrix", rows: "vocabulary × d", stack: "vectors of your question", more: "more",
    },
    space: {
      kicker: "04 · Meaning space",
      title: "Close means similar",
      steps: [
        "<b>What is a vector?</b> A list of numbers you can read as coordinates: 2 numbers are a point on a plane, 3 a point in space, 12,288 a point in a space with 12,288 directions. In this <b>space of meaning</b>, words from similar contexts lie close together.",
        "“polar bear” sits with the animals but also close to Arctic and ice. “penguin” sits close to Antarctica. The model is about to use exactly this knowledge.",
        "Real spaces have thousands of dimensions; you see a 3D sketch with made-up points. <b>Drag the space</b> to rotate it.",
      ],
      hint: "⟲ drag to rotate",
      groups: { animal: "Animals", place: "Places", cold: "Cold", verb: "Actions" },
    },
    attention: {
      kicker: "",
      title: "Attention – who is “it”?",
      steps: [
        "To get its meaning, a word looks at the words before it. For “it” the question is: who is meant? The brighter a word glows, the more attention it gets. A good half goes to “polar bear”.",
        "This happens for every word at once. Together it forms a table, the <b>attention matrix</b>: each row is a word that looks, and it adds up to 100 %. The upper right stays empty, because no word may look into the future.",
        "Why “polar bear”? Penguins already live in Antarctica, so only the polar bear fits. A model looks from many angles at once, called <b>heads</b>. Try the three heads above and tap other words.",
      ],
      headsLabel: "Attention heads:",
      heads: ["1 · Neighbour word", "2 · Who is meant?", "3 · Sentence start"],
      who: "“{w}” looks at:", future: "future: not visible", pick: "Pick a word",
      axis: "row = word that looks · column = word looked at · values in %",
      note: "Technical terms: each word sends a question (query) and offers a label (key) and content (value). Whole words instead of tokens here, raw scores made up, softmax computed live.",
    },
    layers: {
      kicker: "",
      title: "96 transformer layers",
      steps: [
        "Attention is only half of a <b>transformer layer</b>. Then a <b>feed-forward network</b> (MLP) processes each vector on its own. Much of the learned factual knowledge is thought to live there.",
        "Think of each layer as a <b>sieve</b>: the vector falls through and comes out slightly changed, because each layer only adds a small correction (the <b>residual stream</b>). Below you see the number pattern shift from layer to layer.",
        "Why 96? That is the number the developers of GPT-3 chose. Roughly, early layers pick up word pieces and grammar, middle layers meaning and references, late layers prepare the next word. More layers can do more but cost more computing time.",
      ],
      layer: "Layer", attn: "Attention", mlp: "MLP", vecLabel: "vector of “?” after layer",
    },
    softmax: {
      kicker: "07 · Softmax",
      title: "Which word comes next?",
      steps: [
        "After the last layer every token has a new vector. For the next word only the <b>last</b> one counts, the one at the “?”. Through attention it has collected what matters from all the others.",
        "This vector is compared with every word in the vocabulary: one raw number per candidate, a <b>logit</b>. <b>Softmax</b> turns them into probabilities: exponentiate, divide by the sum, 100 % in total.",
        "The <b>temperature</b> T makes the distribution sharper or flatter. Then a word is drawn. Try it.",
        "The drawn word is appended. The table now has one more row, and with it the next round through all layers begins.",
      ],
      vectors: "vectors after layer 96", last: "only this one counts", added: "newly appended", unembed: "× vocabulary matrix → logits",
      prefix: "Answer:", logits: "Logit z", probs: "Probability p",
      temp: "Temperature", sample: "Draw a word", reset: "Reset",
      drawn: "Drawn:", none: "nothing yet",
      note: "8 candidates shown. In a real model the softmax runs over the whole vocabulary.",
    },
    loop: {
      kicker: "08 · Fast forward",
      title: "Word by word",
      steps: [
        "And so it goes on: for every new word everything runs again, tokens, embeddings, 96 layers, softmax.",
        "Fast forward: round after round the answer grows at the bottom. For every word the model computes once through the entire network.",
        "Until an end token is drawn. Then the answer is complete and we fly back out.",
      ],
      stages: ["Tokens", "Vectors", "96 layers", "Softmax"],
      answerLabel: "Answer",
    },
    outro: {
      kicker: "09 · Answer",
      title: "Back in the chat",
      steps: [
        "Outside, the finished answer appears. No database lookup, but prediction, word by word, from learned patterns.",
        "Three loops are nested: the <b>token loop</b> inside the model, the <b>conversation loop</b> with you and, when needed, a <b>tool loop</b>. For tomorrow's weather the model would write a tool call that the harness executes.",
      ],
      again: "Start over", sources: "Sources & further reading",
      src: [
        "Vaswani et al. (2017): Attention Is All You Need. arXiv:1706.03762",
        "Brown et al. (2020): Language Models are Few-Shot Learners (GPT-3). arXiv:2005.14165",
        "Geva et al. (2021): Transformer Feed-Forward Layers Are Key-Value Memories. arXiv:2012.14913",
        "Jay Alammar: The Illustrated Transformer (jalammar.github.io)",
        "3Blue1Brown: Neural Networks, chapters 5–7 (transformers, attention)",
      ],
      disclaimer: "Token IDs, vectors, raw attention scores and logits on this page are made up for illustration. The computations (softmax, mask, temperature, sampling) are real.",
    },
  },
};
