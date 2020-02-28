#! /usr/bin/env node

/*

    THE ORIGINAL WAS IN
    /home/dkz/dev-utpp/museum-1808-massive-upload/upload-batch-85.js

    ATTENTION THIS IS ONLY FOR JPCI (co.th) BUT USING database museum-v3

    Similar to RSYNC:
    (1) get an index from database page_list() => {pageno,checksum-date}
    (2) scan local folder ./en/new-product/<pageno>/index.md2
        for each article, with checksum/date changed
          db.write (page)


    Usage:

    ./303-push [--commit]

*/


const fs = require('fs');
const path = require('path');
const assert = require('assert');
const jsonfile = require('jsonfile')
const yaml = require('js-yaml');
const Massive = require('massive');
const monitor = require('pg-monitor');
var pdfjsLib = require('pdfjs-dist');
//const klaw = require('klaw');

const env = {
  user: process.env.PGUSER,
  port: process.env.PGPORT,
  host: process.env.PGHOST,
  database: process.env.PGDATABASE,
  password: process.env.PGPASSWORD,
};
console.log({env})

const env_yaml = (fs.existsSync('./.env.yaml')) ?
  yaml.safeLoad(fs.readFileSync('./.env.yaml', 'utf8')) : {};
console.log({env_yaml})

Object.assign(env, env_yaml);

const argv = require('yargs')
  .alias('v','verbose').count('verbose')
  .alias('p','password')
  .alias('f','file')
  .alias('d','dir')
  .alias('a','all')
  .alias('c','commit')
  .options({
    'commit': {type:'boolean', default:false},
  }).argv;
console.log('commit:',{argv})

Object.assign(env, argv);

assert(env.user)
assert(env.port)
assert(env.host)
assert(env.database)
assert(env.root) // store

const {root:root_folder, verbose} = env;
const {host,port,user,database,password} = env;

if (!password) {
  console.log(`password for database ${database} is required.
    ex: export PGPASSWORD='secret-pass-for-${database}'
    -stop`)
  process.exit(-1)
}


// ==========================================================================

/*
  FIRST: get directory from server
*/

let db;

function close_db(s) {
  (verbose >=0) && console.log(s,'closing connections pool.');
  db.instance.$pool.end();
  (verbose >=0) && console.log('EOJ.');
}

async function get_new_products_dir() {
  assert(db);
//  const retv = await db.tvec.list_pages('museum.pdf','1908 Allez freres Section 1 20151026.pdf');
  const retv = await db.tvec.list_pages('jpci.products.en.new','new-products.html');
  console.log(`@91: list_pages =>`,retv[0].list_pages);
  return retv[0].list_pages;
}

async function main() {
  console.log(`@110 Massive startup w/passwd: <${password}>`);
  db = await Massive({
      host,
      port,
      database,
      user,
      password
  });
  console.log('Massive is ready.');

  const remote_dir = await get_new_products_dir();
  console.log(`@106: found ${remote_dir.pages.length} new-products`)

  /*********************
      scan local folder ./en/new-product/<pageno>/index.md2
      db.write_page for each new article (page)
  **********************/
  //await scan_local_folder(env.root)

  function get_article_id(fn) {
//    const i =/\^/.exec(fn.split('^')[0])
//    return fn.replace(/^.*\([0-9]+^\).*$/,'($1)')
    return fn.replace(/^.*\/([0-9]+)\^.*$/,'$1')
  }

  function get_local(fn) {
    const v = fs.readFileSync(fn,'utf8').split('\-\-\-');
    const meta = yaml.safeLoad(v[1]);
    const md_code = v[2];
    return {meta, md_code}
  }


  const local_dir = {};
  const root_prefix_length = root_folder.length;
  for (const fn of walkSync(root_folder, ['\.md$'])) {
    const ai = get_article_id(fn)
    //console.log(`-- ai:${ai}`)
    /*
          - open the file
          - compare checksum with server remote_dir
          - if changed: reload.
    */
    const {meta, md_code} = get_local(fn);
    if (remote_dir[ai] && remote_dir[ai].checksum && (meta.checksum == remote_dir[ai].checksum)) continue;

    const jsonb = {
      xid: ai
    }

    Object.assign(jsonb, meta, {
      timeStamp: new Date(),
      textContent: md_code
    })

    //console.log(yaml.safeDump(jsonb));
    const baseName = 'new-products.html';
    const pageNo = ai;
    const raw_text = `${jsonb.article_id} - ${jsonb.sku} ` + jsonb.textContent;

    console.log(`writing ${ai}...`)
    const retv = await db.tvec.write_page('jpci.products.en',baseName, pageNo, jsonb, raw_text);
  }

  console.log(`@127: found ${Object.keys(local_dir).length} article/files.`)
  close_db(`@107:`);
}


try {
  main()
//  .then(()=>{})
  .catch(err=>{
    console.log(`@95 err:`,err)
    close_db();
  });
}
catch (err) {
  console.log(`@90 `,err)
}
return;

function *walkSync(dir,patterns) {
  const files = fs.readdirSync(dir, 'utf8');
//  console.log(`scanning-dir: <${dir}>`)
  for (const file of files) {
    try {
      let pathToFile = path.join(dir, file);
      if (file.startsWith('.')) continue; // should be an option to --exclude
        const fstat = fs.statSync(pathToFile);

      if (fs.statSync(pathToFile).isSymbolicLink()) {
        let pathToFile = fs.realpathSync(pathToFile)
      }

      const isDirectory = fs.statSync(pathToFile).isDirectory();
      if (isDirectory) {
        if (file.startsWith('.')) continue;
          yield *walkSync(pathToFile, patterns);
      } else {
        if (file.startsWith('.')) continue;
        let failed = false;
        for (pat of patterns) {
          const regex = new RegExp(pat,'gi');
          if (file.match(regex)) continue;
          failed = true;
          break;
        };
        if (!failed)
        yield pathToFile;
      }
    }
    catch(err) {
      console.log(`ALERT on file:${ path.join(dir, file)} err:`,err)
//      console.log(`ALERT err:`,err)
      continue;
    }
  }
}



let nfiles =0;
let npages =0;


const etime = new Date().getTime();


async function walk(db) {
  return new Promise((resolve, reject) =>{
    klaw(root_folder, {
        //filter: (item)=>{return item.path.endsWith('.pdf')}
        filter: (item)=> {
//          console.log(`@144 filter nfiles:${nfiles}`)
          return(nfiles<10) // no effect because
        }
    })
    .on('data', async (item) =>{
        let {path:fn} = item;
        if (fn.endsWith('.pdf')) {
  //        console.log(`file[${nfiles}]`, fn)
          nfiles ++;
          if (nfiles <=10*1000) {
            console.log(`@155 ondata nfiles:${nfiles}`)
            await upload_museum_pages(fn,db);
            console.log(`===================================`)
          }
        }
    })/*
      .on('readable', function () {
        let item
        while ((item = this.read())) {
          console.log(`x:`, item)
        }
      })*/
    .on('error', (err, item) => {
        console.log(err.message)
        console.log(item.path) // the file the error occurred on
        reject(err)
    })
    .on('end', () => {
        console.log(`klaw done etime:${new Date().getTime() - etime}ms.`);
        resolve({nfiles:999, npages:99999});
    })
  }) // promise
} // walk


async function upload_page() {

}

async function upload_museum_pages(fn,db) {
//  const xid = path.dirname(fn).split('/'); // last one
  (verbose >=2) && console.log(`@180 entering upload_museum_pages(${fn})`)
  const dirname = path.dirname(fn);
  let xid = dirname.substring(dirname.lastIndexOf('/'));
  if (!xid) {
    console.log(`@183:`,path.dirname(fn).split('/'))
    console.log(`@184:`,path.dirname(fn).split('/')[-1])
    throw 'FATAL'
  }
  if (xid[0] != '/') {
    console.log(`@190:`,path.dirname(fn))
    console.log(`@191 xid:`,xid)
    throw 'FATAL';
  }
  xid = xid.substring(1);
  console.log(`@182 XID:${xid}`)
  const fn2 = fs.realpathSync(fn)
  const baseName = path.basename(fn2);
  const doc = await pdfjsLib.getDocument(fn2).promise;
//  npages += doc.numPages;
//  console.log(`[${nfiles++}] npages:${doc.numPages} <${fn}> `);

  for (let pageNo=1; pageNo <= doc.numPages; pageNo++) {
    const txt_fn = (fn + `-${('0000'+pageNo).substr(-4)}.txt`);
    (verbose >=2) && console.log(`@203 processing page (${txt_fn}) commit=${argv.commit}`)
    if (!fs.existsSync(txt_fn)) {
      console.log(`@205 ALERT file-not-found: <${txt_fn}>`)
      continue;
    }

    const raw_text = fs.readFileSync(txt_fn, 'utf8')

    if (argv.commit) {
      try {
        npages ++;
        console.log(`COMMIT page:${pageNo} total:${npages} files:${nfiles}`);
//        console.log(`-- page ${pageNo} raw_text:${raw_text.length}`);
//        const ts_vector = undefined;
        const json_data = {xid}
        const retv = await db.tvec.write_page('museum.pdf',baseName, pageNo, json_data, raw_text);
        console.log(`@195 -- page ${nfiles}.${pageNo} raw_text.length:${raw_text.length} retv:`, {retv})
      }
      catch(err) {
        console.log(err)
      }
    }
  }; // each page
}


return;




function _assert(b, o, err_message) {
  if (!b) {
    console.log(`[${err_message}]_ASSERT=>`,o);
    console.trace(`[${err_message}]_ASSERT`);
    throw {
      message: err_message // {message} to be compatible with other exceptions.
    }
  }
}
