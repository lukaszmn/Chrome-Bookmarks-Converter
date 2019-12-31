function ready() {
	document.getElementById('convert').addEventListener('click', () => {
		try {
			processAll();
		} catch (err) {
			alert(err);
		}
	});
}

function processAll() {
	const editor = document.getElementById('convertText');

	const text = editor.value;

	const read = id => document.getElementById(id).value
		.replace('\\t', '\t')
		.replace('\\n', '\n');

	const config = {
		indent: read('indent'),
		indentAfterHeader: document.getElementById('indentAfterHeader').checked,
		formatHeader: read('formatHeader'),
		formatUrl: read('formatUrl'),
		formatFolder: read('formatFolder')
	};

	const converted = convert(text, config);

	editor.value = converted;
}


document.addEventListener('DOMContentLoaded', ready, false);


const SEP = '&^]';
const TYPE_URL = 'url';
const TYPE_FOLDER = 'folder';


function convert(text, config) {
	const obj = JSON.parse(text);

	let res = '';
	for (const rootName in obj.roots) {
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
		const parsed = parse(root, []);
		res += format(parsed, firstIndent, config).join('\n');
	}

	return res;
}


function parse(parent, parentNames) {
	const res = [];

	for (const child of parent.children) {
		if (child.url) {
			res.push({
				type: TYPE_URL,
				name: child.name,
				url: child.url
			});
		} else if (child.children) {
			const parentNames2 = parentNames.slice(0);
			parentNames2.push(child.name);
			const parentNamesS = parentNames2.join(' > ');

			const children = parse(child, parentNames2);

			res.push({
				type: TYPE_FOLDER,
				name: child.name,
				path: parentNamesS,
				children: children
			});
		} else {
			console.log('Invalid node:', child);
		}
	}

	return res;
}


function format(arr, indent, config) {
	const res = [];

	for (const item of arr) {
		switch (item.type) {

			case TYPE_URL:
				const formattedUrl = config.formatUrl
					.replace('NAME', SEP + 'NAME' + SEP)
					.replace('URL', SEP + 'URL' + SEP)
					.replace(SEP + 'NAME' + SEP, item.name)
					.replace(SEP + 'URL' + SEP, item.url);
				res.push(indent + formattedUrl);
				break;

			case TYPE_FOLDER:
				const formattedFolder = config.formatFolder
					.replace('NAME', SEP + 'NAME' + SEP)
					.replace('PATH', SEP + 'PATH' + SEP)
					.replace(SEP + 'NAME' + SEP, item.name)
					.replace(SEP + 'PATH' + SEP, item.path);
				res.push(indent + formattedFolder);

				res.push(...format(item.children, indent + config.indent, config));
				break;
		}
	}

	return res;
}
