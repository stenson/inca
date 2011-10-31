INCA
=================
Inca is a simple tool for prototyping web apps & sites with Mustache.

<img src="https://github.com/stenson/inca/raw/master/lib/inca-tern.jpeg"/>

Briefly
-------
Inca is for prototyping websites, but it's more than just CSS & HTML. Not much more, just slightly more. What does that mean? Instead of writing HTML, Inca lets you write .mustache files full of variables. So, instead of writing your prototype data directly into your html, like `<li>Name of Test Dude 1</li><li>Name of Test Dude 2</li>`, Inca lets you write something like `{{#test_data}}<li>{{name_of_test_dude_1}}</li><li>{{name_of_test_dude_2}}</li>{{/test_data}}`

Ok. That example was lame, admittedly. In fact, it makes Inca look pretty dumb, since you have to throw in all that extra surrounding stuff. Whatever. It's not about brevity, it's about POWER.

Let's say you want to prototype a website that is a database of American old-time folk musicians, meaning you need to render a bunch of `li`'s, and each one has a ton of markup in it. The markup is repeated over and over again, just the variables are changing inside each of the `li`'s.

It would look like this in HTML.

```
<ul>
  <li>
    <span>Linzay Young</span>
    <small>Fiddler</small>
    <strong>Louisiana</strong>
  </li>
  <li>
    <span>Chris Coole</span>
    <small>Banjoist</small>
    <strong>Oregon</strong>
  </li>
  <li>
    <span>Tommy Jarrell</span>
    <small>Fiddler</small>
    <strong>North Carolina</strong>
  </li>
</ul>
```

And like this in Inca, so you'd split it up between two files. In the first file:

```
<ul>
  {{>musician:linzay_young}}
  {{>musician:chris_coole}}
  {{>musician:tommy_jarrell}}
</ul>
```

You'll also need a partial, musician.mustache, that looks like this.
```
<li>
  <strong>{{name}}</strong>
  <small>{{talent}}</small>
  <span>{{location}}</span>
</li>
```

Also, you'll need some json files, like `linzay_young.json` & `chris_coole.json` & `tommy_jarrell.json`. For instance, here's `linzay_young.json`

```
  {
    "name": "Linzay Young",
    "talent": "fiddler",
    "location": "North Carolina"
  }
```

Huh, this is making Inca seem like *more* work than just prototyping in HTML. But you get the point.

Usage
-----
To use Inca, you must have Node and npm (the node package manager) installed. In Terminal, download and install inca with the command:

```
sudo npm install inca -g
```

This will add the command `inca` to your terminal.
Starting the server is now pretty easy.
Just make a directory (e.g. "righteous-site") and do this:

```
cd righteous-site
inca init
```

Fresh.

The command `inca init` puts three directories into the directory you just created.

- `/json` -> all of your json files
- `/mustaches` -> all of your mustache templates
- `/public` -> everything else: js files, css files, images, etc.

To start the server, you just type `inca`.
However, when you go to `http://localhost:8083`, there won't be much to see, since our `/json` directory and our `/mustache` directory are empty.
For now you can skip putting anything in `/json`. Just create two files in the `/mustaches` directory: `layout.mustache` and `index.mustache`.

`layout.mustache` only needs to have one thing in it: `{{{yield}}}`. That's because `layout.mustache` will be rendered as the container for all other mustaches you write.
`index.mustache` — the default mustache, which will be rendered when you hit `http://localhost:8083` — can have anything in it, like `<h1>Whatup world!</h1>`.

Now you're ready to run the server, so just type `inca`, then visit `http://locahost:8083` in your favorite browser.

If you clone or download this repo, you'll see exactly what we're talking about. In fact, to see an example inca site, you can just go ahead and download this repo. Then, once you've `cd`'d into the inca project, type `cd example-site` and then `inca`.

That will start the server, and when you hit `http://locahost:8083` in your favorite browser, inca will display your `index.mustache` file, by default. **Boom!**

Extensions to Mustache Syntax
-----------------------------


Versioning
----------

For transparency and insight into our release cycle, and for striving to maintain backwards compatibility, Inca will be maintained under the Semantic Versioning guidelines as much as possible.

Releases will be numbered with the follow format:

`<major>.<minor>.<patch>`

And constructed with the following guidelines:

* Breaking backwards compatibility bumps the major
* New additions without breaking backwards compatibility bumps the minor
* Bug fixes and misc changes bump the patch

For more information on SemVer, please visit http://semver.org/.


Bug tracker
-----------

Have a bug? Please create an issue here on GitHub!


Authors
-------

**Rob Stenson**

+ http://twitter.com/blickwickle
+ http://github.com/stenson


Copyright and license
---------------------

Copyright 2011 Rob Stenson.

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this work except in compliance with the License.
You may obtain a copy of the License in the LICENSE file, or at:

   http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
