// MEN201 quiz — question format registry.
// Each format: { label, manual?, inline?, render(q) -> HTML, collect(root) -> given }
// Pure module (no Firebase imports).
//
// Image paths in question data are relative to the SITE root; the quiz pages
// live under /quiz/, so they are prefixed with "../".

export function imgSrc(path) {
  return "../" + path;
}

function esc(s) {
  return String(s).replace(/[&<>"']/g, (c) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;",
  }[c]));
}

function shuffleIdx(n) {
  const idx = Array.from({ length: n }, (_, i) => i);
  for (let i = idx.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [idx[i], idx[j]] = [idx[j], idx[i]];
  }
  return idx;
}

const collectRadio = (root) => {
  const el = root.querySelector('input[name="ans"]:checked');
  return { givenIndex: el ? Number(el.value) : null };
};

const collectText = (root) => {
  const el = root.querySelector(".textans");
  return { givenText: el ? el.value : "" };
};

export const FORMATS = {
  mcq: {
    label: "Multiple choice",
    render(q) {
      return (q.options || [])
        .map(
          (o, i) =>
            `<label class="opt"><input type="radio" name="ans" value="${i}"><span>${esc(o)}</span></label>`
        )
        .join("");
    },
    collect: collectRadio,
  },

  "true-false": {
    label: "True / False",
    render() {
      return (
        `<label class="opt"><input type="radio" name="ans" value="0"><span>True</span></label>` +
        `<label class="opt"><input type="radio" name="ans" value="1"><span>False</span></label>`
      );
    },
    collect: collectRadio,
  },

  "multi-response": {
    label: "Multiple response",
    render(q) {
      return (
        `<p class="hint">Select all that apply.</p>` +
        (q.options || [])
          .map(
            (o, i) =>
              `<label class="opt"><input type="checkbox" name="ans" value="${i}"><span>${esc(o)}</span></label>`
          )
          .join("")
      );
    },
    collect(root) {
      const els = [...root.querySelectorAll('input[name="ans"]:checked')];
      return { givenIndices: els.map((e) => Number(e.value)) };
    },
  },

  "fill-blank": {
    label: "Fill in the blank",
    inline: true, // the question text (with ___ placeholders) is rendered here
    render(q) {
      const parts = String(q.question).split("___");
      let html = "";
      parts.forEach((p, i) => {
        html += `<span>${esc(p)}</span>`;
        if (i < parts.length - 1) {
          html += `<input class="blank" data-i="${i}" type="text" autocomplete="off">`;
        }
      });
      return `<div class="fillq">${html}</div>`;
    },
    collect(root) {
      const els = [...root.querySelectorAll(".blank")];
      return { givenBlanks: els.map((e) => e.value) };
    },
  },

  numerical: {
    label: "Numerical",
    render(q) {
      return (
        `<div class="numq"><input class="num" type="text" inputmode="decimal" placeholder="0.0" autocomplete="off">` +
        (q.units ? `<span class="unit">${esc(q.units)}</span>` : "") +
        `</div>`
      );
    },
    collect(root) {
      const el = root.querySelector(".num");
      return { given: el ? el.value : "" };
    },
  },

  matching: {
    label: "Matching",
    render(q) {
      const pairs = q.pairs || [];
      const order = shuffleIdx(pairs.length);
      const opts =
        `<option value="-1" selected>Select…</option>` +
        order.map((i) => `<option value="${i}">${esc(pairs[i].right)}</option>`).join("");
      return (
        `<div class="matchq">` +
        pairs
          .map(
            (p, i) =>
              `<div class="matchrow"><span class="match-left">${esc(p.left)}</span><select data-i="${i}">${opts}</select></div>`
          )
          .join("") +
        `</div>`
      );
    },
    collect(root) {
      const els = [...root.querySelectorAll("select")];
      return { givenPairs: els.map((e) => Number(e.value)) };
    },
  },

  "image-mcq": {
    label: "Image question",
    render(q) {
      const img = q.image
        ? `<figure class="qimg"><img src="${imgSrc(q.image)}" alt="measurement diagram"></figure>`
        : "";
      return img + FORMATS.mcq.render(q);
    },
    collect: collectRadio,
  },

  "short-answer": {
    label: "Short answer",
    manual: true,
    render() {
      return `<textarea class="textans" rows="3" placeholder="Your answer…"></textarea>`;
    },
    collect: collectText,
  },

  "long-answer": {
    label: "Long answer",
    manual: true,
    render() {
      return `<textarea class="textans" rows="7" placeholder="Your answer…"></textarea>`;
    },
    collect: collectText,
  },

  essay: {
    label: "Essay",
    manual: true,
    render() {
      return `<textarea class="textans" rows="10" placeholder="Your answer…"></textarea>`;
    },
    collect: collectText,
  },

  "practical-report": {
    label: "Field practical report",
    manual: true,
    render() {
      return `<textarea class="textans" rows="8" placeholder="Report summary (photos are uploaded in the practical module)…"></textarea>`;
    },
    collect: collectText,
  },
};

export function formatOf(q) {
  return FORMATS[q.questionType] || FORMATS.mcq;
}
