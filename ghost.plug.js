var mod=(()=>{var A=Object.defineProperty;var V=Object.getOwnPropertyDescriptor;var z=Object.getOwnPropertyNames;var Q=Object.prototype.hasOwnProperty;var m=(e,t)=>{for(var r in t)A(e,r,{get:t[r],enumerable:!0})},W=(e,t,r,n)=>{if(t&&typeof t=="object"||typeof t=="function")for(let o of z(t))!Q.call(e,o)&&o!==r&&A(e,o,{get:()=>t[o],enumerable:!(n=V(t,o))||n.enumerable});return e};var Z=e=>W(A({},"__esModule",{value:!0}),e);var Ke={};m(Ke,{functionMapping:()=>Y});function R(e){let t=atob(e),r=t.length,n=new Uint8Array(r);for(let o=0;o<r;o++)n[o]=t.charCodeAt(o);return n}function X(e,t){return syscall("sandboxFetch.fetch",e,t)}function U(){globalThis.nativeFetch=globalThis.fetch,globalThis.fetch=async function(e,t){let r=await X(e,t&&{method:t.method,headers:t.headers,body:t.body});return new Response(r.base64Body?R(r.base64Body):null,{status:r.status,headers:r.headers})}}typeof Deno>"u"&&(self.Deno={args:[],build:{arch:"x86_64"},env:{get(){}}});var S=new Map,v=0;function P(e){self.postMessage(e)}self.syscall=async(e,...t)=>await new Promise((r,n)=>{v++,S.set(v,{resolve:r,reject:n}),P({type:"sys",id:v,name:e,args:t})});function $(e,t){self.addEventListener("message",r=>{(async()=>{let n=r.data;switch(n.type){case"inv":{let o=e[n.name];if(!o)throw new Error(`Function not loaded: ${n.name}`);try{let i=await Promise.resolve(o(...n.args||[]));P({type:"invr",id:n.id,result:i})}catch(i){console.error(i),P({type:"invr",id:n.id,error:i.message})}}break;case"sysr":{let o=n.id,i=S.get(o);if(!i)throw Error("Invalid request id");S.delete(o),n.error?i.reject(new Error(n.error)):i.resolve(n.result)}break}})().catch(console.error)}),P({type:"manifest",manifest:t})}U();function k(e,t){if(t(e))return[e];let r=[];if(e.children)for(let n of e.children)r=[...r,...k(n,t)];return r}function C(e,t){if(e.children){let r=e.children.slice();for(let n of r){let o=t(n);if(o!==void 0){let i=e.children.indexOf(n);o?e.children.splice(i,1,o):e.children.splice(i,1)}else C(n,t)}}}function p(e,t){return k(e,r=>r.type===t)[0]}function D(e,t){k(e,t)}function E(e){let t=[];if(e.text!==void 0)return e.text;for(let r of e.children)t.push(E(r));return t.join("")}typeof self>"u"&&(self={syscall:()=>{throw new Error("Not implemented here")}});var s=self.syscall;var f={};m(f,{parseMarkdown:()=>te});function te(e){return s("markdown.parseMarkdown",e)}var u={};m(u,{deleteAttachment:()=>fe,deletePage:()=>se,getAttachmentMeta:()=>ue,getPageMeta:()=>ne,listAttachments:()=>ce,listPages:()=>re,listPlugs:()=>ae,readAttachment:()=>le,readPage:()=>oe,writeAttachment:()=>de,writePage:()=>ie});function re(e=!1){return s("space.listPages",e)}function ne(e){return s("space.getPageMeta",e)}function oe(e){return s("space.readPage",e)}function ie(e,t){return s("space.writePage",e,t)}function se(e){return s("space.deletePage",e)}function ae(){return s("space.listPlugs")}function ce(){return s("space.listAttachments")}function ue(e){return s("space.getAttachmentMeta",e)}function le(e){return s("space.readAttachment",e)}function de(e,t){return s("space.writeAttachment",e,t)}function fe(e){return s("space.deleteAttachment",e)}var l=self.syscall;var g={};m(g,{parse:()=>we,stringify:()=>be});function we(e){return l("yaml.parse",e)}function be(e){return l("yaml.stringify",e)}async function Te(e,t){let r=await u.readPage(e),n=await f.parseMarkdown(r),o;return D(n,i=>{if(i.type!=="FencedCode")return!1;let c=p(i,"CodeInfo");if(t&&!c||t&&!t.includes(c.children[0].text))return!1;let y=p(i,"CodeText");return y?(o=y.children[0].text,!0):!1}),o}async function x(e,t=["yaml"]){let r=await Te(e,t);if(r!==void 0)try{return g.parse(r)}catch(n){throw console.error("YAML Page parser error",n),new Error(`YAML Error: ${n.message}`)}}var Ae="SETTINGS";async function H(e,t){try{let n=(await x(Ae,["yaml"])||{})[e];return n===void 0?t:n}catch(r){if(r.message==="Not found")return t;throw r}}async function j(e){try{let r=(await x("SECRETS",["yaml","secrets"]))[e];if(r===void 0)throw new Error(`No such secret: ${e}`);return r}catch(t){throw t.message==="Not found"?new Error(`No such secret: ${e}`):t}}function ve(e){return e.replaceAll(" ","_")}async function F(e,t){let r=await f.parseMarkdown(e);return C(r,n=>{if(n.type==="WikiLink"){let o=n.children[1].children[0].text;return t&&!t.includes(o)?{text:`_${o}_`}:{text:`[${o}](/${ve(o)})`}}if(n.type==="CommentBlock"||n.type==="Comment"||n.type==="NamedAnchor")return null;if(n.type==="Hashtag")return{text:`__${n.children[0].text}__`};if(n.type==="URL"){let o=n.children[0].text;o.indexOf("://")===-1&&(n.children[0].text=`fs/${o}`),console.log("Link",o)}if(n.type==="FencedCode"){let o=p(n,"CodeInfo");if(!o)return;if(o.children[0].text==="meta")return null}}),E(r)}var d={};m(d,{decode:()=>Ne,encode:()=>Me});var a=["A","B","C","D","E","F","G","H","I","J","K","L","M","N","O","P","Q","R","S","T","U","V","W","X","Y","Z","a","b","c","d","e","f","g","h","i","j","k","l","m","n","o","p","q","r","s","t","u","v","w","x","y","z","0","1","2","3","4","5","6","7","8","9","+","/"];function I(e){let t=typeof e=="string"?new TextEncoder().encode(e):e instanceof Uint8Array?e:new Uint8Array(e),r="",n,o=t.length;for(n=2;n<o;n+=3)r+=a[t[n-2]>>2],r+=a[(t[n-2]&3)<<4|t[n-1]>>4],r+=a[(t[n-1]&15)<<2|t[n]>>6],r+=a[t[n]&63];return n===o+1&&(r+=a[t[n-2]>>2],r+=a[(t[n-2]&3)<<4],r+="=="),n===o&&(r+=a[t[n-2]>>2],r+=a[(t[n-2]&3)<<4|t[n-1]>>4],r+=a[(t[n-1]&15)<<2],r+="="),r}function _(e){let t=atob(e),r=t.length,n=new Uint8Array(r);for(let o=0;o<r;o++)n[o]=t.charCodeAt(o);return n}function ke(e){if(e.length%4===2)return e+"==";if(e.length%4===3)return e+"=";if(e.length%4===1)throw new TypeError("Illegal base64url string!");return e}function Ce(e){if(!/^[-_A-Z0-9]*?={0,2}$/i.test(e))throw new TypeError("Failed to decode base64url: invalid character");return ke(e).replace(/\-/g,"+").replace(/_/g,"/")}function Ee(e){return e.replace(/=/g,"").replace(/\+/g,"-").replace(/\//g,"_")}function Me(e){return Ee(I(e))}function Ne(e){return _(Ce(e))}var h=new TextEncoder,Re=new TextDecoder;function K(e){return e!==null}function L(e){return e===null}function w(e){return typeof e=="string"}function Ue(e){return w(e.hash?.name)}function $e(e){return w(e.namedCurve)}function B(e,t){if(e==="none"){if(K(t))throw new Error(`The alg '${e}' does not allow a key.`);return!0}else{if(!t)throw new Error(`The alg '${e}' demands a key.`);let r=t.algorithm,n=M(e);if(r.name===n.name){if(Ue(r))return r.hash.name===n.hash.name;if($e(r))return r.namedCurve===n.namedCurve}return!1}}function M(e){switch(e){case"HS256":return{hash:{name:"SHA-256"},name:"HMAC"};case"HS384":return{hash:{name:"SHA-384"},name:"HMAC"};case"HS512":return{hash:{name:"SHA-512"},name:"HMAC"};case"PS256":return{hash:{name:"SHA-256"},name:"RSA-PSS",saltLength:32};case"PS384":return{hash:{name:"SHA-384"},name:"RSA-PSS",saltLength:48};case"PS512":return{hash:{name:"SHA-512"},name:"RSA-PSS",saltLength:64};case"RS256":return{hash:{name:"SHA-256"},name:"RSASSA-PKCS1-v1_5"};case"RS384":return{hash:{name:"SHA-384"},name:"RSASSA-PKCS1-v1_5"};case"RS512":return{hash:{name:"SHA-512"},name:"RSASSA-PKCS1-v1_5"};case"ES256":return{hash:{name:"SHA-256"},name:"ECDSA",namedCurve:"P-256"};case"ES384":return{hash:{name:"SHA-384"},name:"ECDSA",namedCurve:"P-384"};default:throw new Error(`The jwt's alg '${e}' is not supported.`)}}async function q(e,t,r){return L(t)?"":d.encode(new Uint8Array(await crypto.subtle.sign(M(e),t,h.encode(r))))}function De(e,t){return`${d.encode(h.encode(JSON.stringify(e)))}.${d.encode(h.encode(JSON.stringify(t)))}`}async function G(e,t,r){if(B(e.alg,r)){let n=De(e,t),o=await q(e.alg,r,n);return`${n}.${o}`}else throw new Error(`The jwt's alg '${e.alg}' does not match the key's algorithm.`)}function N(e){return Math.round((e instanceof Date?e.getTime():Date.now()+e*1e3)/1e3)}var Oe=e=>Uint8Array.from(e.match(/.{1,2}/g).map(t=>parseInt(t,16))),b=class{constructor(t,r){this.url=t;this.key=r}async init(){let[t,r]=this.key.split(":"),n=await crypto.subtle.importKey("raw",Oe(r),{name:"HMAC",hash:"SHA-256"},!0,["sign","verify"]);this.token=await G({alg:"HS256",kid:t,typ:"JWT"},{exp:N(5*60),iat:N(0),aud:"/v3/admin/"},n)}async listPosts(){return(await(await fetch(`${this.url}/ghost/api/v3/admin/posts?order=published_at+DESC`,{headers:{Authorization:`Ghost ${this.token}`}})).json()).posts}async listMarkdownPosts(){let t=[];for(let r of await this.listPosts()){let n=JSON.parse(r.mobiledoc);n.cards.length>0&&n.cards[0][0]==="markdown"&&t.push(r)}return t}publishPost(t){return this.publish("posts",t)}publishPage(t){return this.publish("pages",t)}async publish(t,r){let o=await(await fetch(`${this.url}/ghost/api/v3/admin/${t}/slug/${r.slug}`,{headers:{Authorization:`Ghost ${this.token}`,"Content-Type":"application/json"}})).json();if(o[t]){let i=o[t][0];return r.updated_at=i.updated_at,(await(await fetch(`${this.url}/ghost/api/v3/admin/${t}/${i.id}`,{method:"PUT",headers:{Authorization:`Ghost ${this.token}`,"Content-Type":"application/json"},body:JSON.stringify({[t]:[r]})})).json())[t][0]}else return r.status||(r.status="draft"),(await(await fetch(`${this.url}/ghost/api/v3/admin/${t}`,{method:"POST",headers:{Authorization:`Ghost ${this.token}`,"Content-Type":"application/json"},body:JSON.stringify({[t]:[r]})})).json())[t][0]}};function He(e){return JSON.stringify({version:"0.3.1",atoms:[],cards:[["markdown",{markdown:e}]],markups:[],sections:[[10,0],[1,"p",[]]]})}var je=/#\s*([^\n]+)\n(([^\n]|\n)+)$/;async function Fe(e){let t=je.exec(e);if(t){let[,r,n]=t;return{title:r,mobiledoc:He(await F(n))}}throw Error("Post should stat with a # header")}async function Ie(){let e=await H("ghost"),t=await j("ghost");for(let[r,n]of Object.entries(e))n.adminKey=t[r];return e}async function J(e){let t=await Ie(),[,r,n,o]=e.uri.split(":"),i=t[r];if(!i)throw new Error("No config for instance "+r);let c=new b(i.url,i.adminKey);await c.init();let y=await u.readPage(e.name),T=await Fe(y);return T.slug=o,n==="post"?await c.publishPost(T):n==="page"&&await c.publishPage(T),!0}var Y={publish:J},_e={name:"ghost",requiredPermissions:["fetch"],functions:{publish:{path:"./ghost.ts:publish",events:["share:ghost"]}},assets:{}};$(Y,_e);return Z(Ke);})();
