function ready() {
    document.getElementById('convert').addEventListener('click', () => {
        const editor = document.getElementById('convertText');

        const text = editor.value;

        const config = {
            indent: document.getElementById('indent').value.replace('\\t', '\t'),
            indentAfterHeader: document.getElementById('indentAfterHeader').checked,
            formatHeader: document.getElementById('formatHeader').value,
            formatUrl: document.getElementById('formatUrl').value,
            formatFolder: document.getElementById('formatFolder').value
        };

        const converted = convert(text, config);

        editor.value = converted;
    });
}


document.addEventListener('DOMContentLoaded', ready, false);


const SEP = '&^]';


function convert(text, config) {
    const obj = JSON.parse(text);

    let res = '';
    for (let rootName in obj.roots) {
        // rootName == "bookmark_bar"
        const root = obj.roots[rootName];

        if (!root.children || root.children.length === 0)
            continue;

        const name = config.formatHeader
            .replace('ID', SEP + 'ID' + SEP)
            .replace('NAME', SEP + 'NAME' + SEP)
            .replace(SEP + 'ID' + SEP, rootName)
            .replace(SEP + 'NAME' + SEP, root.name);
        res += name + '\n';

        const firstIndent = config.indentAfterHeader ? config.indent : '';
        res += process(root, [], firstIndent, config);
    }

    return res;
}


function process(parent, parentNames, indent, config) {
    let res = '';

    for (let child of parent.children) {
        if (child.url) {
            const formatted = config.formatUrl
                .replace('NAME', SEP + 'NAME' + SEP)
                .replace('URL', SEP + 'URL' + SEP)
                .replace(SEP + 'NAME' + SEP, child.name)
                .replace(SEP + 'URL' + SEP, child.url);
            res += indent + formatted + '\n';
        } else if (child.children) {
            const parentNames2 = parentNames.slice(0);
            parentNames2.push(child.name);
            const parentNamesS = parentNames2.join(' > ');

            const formatted = config.formatFolder
                .replace('NAME', SEP + 'NAME' + SEP)
                .replace('PATH', SEP + 'PATH' + SEP)
                .replace(SEP + 'NAME' + SEP, child.name)
                .replace(SEP + 'PATH' + SEP, parentNamesS);
            res += indent + formatted + '\n';
            
            res += process(child, parentNames2, indent + config.indent, config);
        } else {
            console.log('Invalid node:', child);
        }
    }

    return res;
}
