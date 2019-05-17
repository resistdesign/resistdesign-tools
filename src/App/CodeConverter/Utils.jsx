const regStr = '\\\$\\\{(.*?)\\\}';
const reg = new RegExp(regStr, 'gm');

export const getLines = (content = '') => content.split('\n');

export const getFormatParts = (format) => {
  const tagsMatch = format.match(reg);
  const tags = tagsMatch ? tagsMatch : [];
  const formatParts = [];

  let tempFormat = format;

  for (const k in tags) {
    const t = tags[k];

    tempFormat = tempFormat.split(t).join('${}${}');
  }

  const tfParts = tempFormat.split('${}');

  let tagUsed = false;

  for (const l in tfParts) {
    const tp = tfParts[l];

    if (tp) {
      formatParts.push(tp);

      tagUsed = false;
    } else {
      // TRICKY: Look out for '${}${}${}${}'.
      if (tagUsed) {
        tagUsed = false;
      } else {
        formatParts.push(tags.shift());

        tagUsed = true;
      }
    }
  }

  return formatParts;
};

export const isTag = (item) => {
  if (!item) return false;

  if (item.substr(item.length - 1, 1) !== '}') return false;

  return item.indexOf('${') === 0;
};

export const consumeFormatPart = (line, formatPart, closing, upToPart) => {
  if (!line || !formatPart) return line;

  if (!upToPart) {
    if (line.length < formatPart.length) return line;

    if (!closing) {
      return line.substr(formatPart.length, line.length);
    } else {
      return line.substr(0, line.length - formatPart.length);
    }
  } else {
    if (!closing) {
      line = line.substr(line.indexOf(formatPart), line.length);
    } else {
      line = line.substr(0, line.lastIndexOf(formatPart) + formatPart.length);
    }
  }

  return line;
};

export const consumeFormatPartsFromList = (line, formatParts, closing) => {
  const fpts = closing ? formatParts.reverse() : formatParts;

  for (let i = 0; i < fpts.length; i++) {
    const part = fpts[i];
    const isATag = isTag(part);

    if (!isATag) {
      line = consumeFormatPart(line, part, closing);
    } else {
      if (i < fpts.length - 1) {
        const nextPart = fpts[i + 1];

        line = consumeFormatPart(line, nextPart, closing, true);
      } else {
        line = '';

        break;
      }
    }
  }

  return line;
};

export const getTagValueFromLine = (tag, formatParts, line) => {
  if (formatParts.length < 1) return '';

  if (formatParts.length === 1) {
    if (formatParts[0] === tag) {
      return line;
    } else {
      return '';
    }
  }

  const openConsumables = [];
  const closeConsumables = [];

  let closing = false;

  for (const k in formatParts) {
    const fPart = formatParts[k];

    if (closing) {
      closeConsumables.push(fPart);
    } else {
      if (fPart === tag) {
        closing = true;
      } else {
        openConsumables.push(fPart);
      }
    }
  }

  // Consume line.
  line = consumeFormatPartsFromList(line, openConsumables);
  line = consumeFormatPartsFromList(line, closeConsumables, true);

  return line;
};

export const convertLines = (lines, format, template) => {
  const formatParts = getFormatParts(format);
  const tagsMatch = format.match(reg);
  const tags = tags ? tagsMatch : [];
  const newLines = [];

  for (const k in lines) {
    const line = lines[k];

    let newLine = template;

    for (const l in tags) {
      const tag = tags[l];
      const val = getTagValueFromLine(tag, formatParts, line);

      newLine = newLine.split(tag).join(val);
    }

    newLines.push(newLine);
  }

  return newLines;
};
