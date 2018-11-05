import Pablo from '../src';
import window from './window';
import './web-anim';

const { document } = window;

Pablo.window = window;
Pablo.document = document;

// let collection = Pablo(8,9,10);

// console.log({collection});

// console.log(collection.bar());


const { svg, html } = Pablo;


const root1 = Pablo(document.body).child('svg');
const group = root1.child('g');

group.append('text', { fill: 'red' });
group.append('text', { fill: 'blue' });
group.attr('xlink:href', 'http://example.com');

console.log(group.attr(), group[0]);
console.log(group.attr(), Pablo(group[0].firstChild).attr());
console.log(document.body.innerHTML);


Pablo(document.body).attr('style', 'border-color: blue;');
console.log(document.body.style.borderColor);

console.log(root1.markup());
console.log(Pablo.markupToSvgElement(root1.markup()).markup());

console.log(group.children().attr([{fill:'yellow'}, {fill:'pink'}]).attr());

// console.log(Object.keys(document.body.style.constructor.prototype));

group.css({backgroundImage: 'url(#foo)', borderColor:'blue'});
console.log('CSS', group.css());
console.log('.animate()', !!group[0].animate);

console.log(group.children().join('***'));

// group.css({backgroundImage: 'url(#foo)'});
// console.log(group.css()['background-image']);

// group.css({'background-image': 'url(#bar)'});
// console.log(group.css()['backgroundImage']);

// console.log(Object.keys(group.css()));



const svgRoot = Pablo.svg({ width:50, height:50 });
svgRoot.circle({ stroke: 'red' });
console.log('svgRoot', svgRoot.markup());

const htmlRoot = html();

htmlRoot
.body({ 'data-foo': 9 })
.svg({width: 100, height: 100})
.circle({fill:'tan'});

console.log('htmlRoot', htmlRoot.markup());

const htmlRoot2 = html();

htmlRoot2.append(html.body({'data-foo': 7}));

console.log('htmlRoot2', htmlRoot2.markup());


const div = Pablo.el('div', 'html').css({opacity: 0.7, transform: 'none'});

console.log('DIV', div.css());

const animation = div[0].animate({
  opacity: [0.5, 1],
  transform: ['scale(0.5)', 'scale(1)'],
}, {
  direction: 'alternate',
  duration: 500,
  iterations: Infinity,
});

console.log('anim snapshot', animation.currentTime, {computed: window.getComputedStyle(div[0], null).getPropertyValue('opacity'), direct: div[0].style.getPropertyValue('opacity')},  div.css());

setTimeout(() => {
  console.log('anim snapshot', animation.currentTime, {computed: window.getComputedStyle(div[0], null).getPropertyValue('opacity'), direct: div[0].style.getPropertyValue('opacity')},  div.css());
}, 100);

setTimeout(() => {
  console.log('anim snapshot', animation.currentTime, {computed: window.getComputedStyle(div[0], null).getPropertyValue('opacity'), direct: div[0].style.getPropertyValue('opacity')}, div.css());
  animation.cancel();
}, 250);

