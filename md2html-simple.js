const marked = require('marked');
const renderer = new marked.Renderer();
const yaml = require('js-yaml');
const assert = require('assert')


function md2html(data) {
  const v = data.trim().split(/\-\-\-/g); //match(yamlBlockPattern);
  assert(!v[0])
  assert(v.length == 3)

  //console.log(v[1]);
  //console.log(v[2]);

  var json = yaml.safeLoad(v[1], 'utf8');


  console.log({json})
  if (json.format == 'raw-html') {
    return {data:json, html:v[2]}
  }

  const html = marked(v[2], { renderer: renderer });

  return {data:json, html}

}

module.exports = md2html;
