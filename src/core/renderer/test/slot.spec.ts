import { waitForLoad, mockConnect, mockDefine, mockPlatform } from '../../../test';
import { h, VNode } from '../patch';
import { HostElement } from '../../../util/interfaces';


describe('Component slot', () => {
  const plt = mockPlatform();


  it('should relocate nested default slot nodes', (done) => {
    mockDefine(plt, {
      tagNameMeta: 'ion-test',
      componentModuleMeta: class {
        render() {
          return h('spider', [
            h('slot')
          ]);
        }
      }
    });

    const node = mockConnect(plt, '<ion-test>88</ion-test>');

    waitForLoad(plt, node, 'ion-test').then(elm => {
      expect(elm.childNodes[0].nodeName).toBe('SPIDER');
      expect(elm.childNodes[0].childNodes[0].textContent).toBe('88');
      expect(elm.childNodes[0].childNodes.length).toBe(1);
      done();
    });
  });


  it('should relocate nested named slot nodes', (done) => {
    mockDefine(plt, {
      tagNameMeta: 'ion-test',
      componentModuleMeta: class {
        render() {
          return h('monkey', [
            h('slot', { attrs: { name: 'start' } })
          ]);
        }
      }
    });

    const node = mockConnect(plt, '<ion-test><tiger slot="start">88</tiger></ion-test>');

    waitForLoad(plt, node, 'ion-test').then(elm => {
      expect(elm.childNodes[0].nodeName).toBe('MONKEY');
      expect(elm.childNodes[0].childNodes[0].nodeName).toBe('TIGER');
      expect(elm.childNodes[0].childNodes[0].textContent).toBe('88');
      expect(elm.childNodes[0].childNodes[0].childNodes.length).toBe(1);
      done();
    });
  });

  it('no content', (done) => {
    mount({
      parentVNode: h('lion', [
        h('ion-child')
      ]),
      childVNode: h('slot')
    }, (parentElm, childElm) => {
      expect(parentElm.childNodes.length).toBe(1);
      expect(parentElm.childNodes[0].nodeName).toBe('LION');
      expect(parentElm.childNodes[0].childNodes[0].nodeName).toBe('ION-CHILD');
      expect(parentElm.childNodes[0].childNodes[0].childNodes.length).toBe(0);

      parentElm._render();
      childElm._render();
      parentElm._render();
      childElm._render();

      expect(parentElm.childNodes[0].nodeName).toBe('LION');
      expect(parentElm.childNodes[0].childNodes[0].nodeName).toBe('ION-CHILD');
      expect(parentElm.childNodes[0].childNodes[0].childNodes.length).toBe(0);

      done();
    });
  });

  it('no content, nested child slot', (done) => {
    mount({
      parentVNode: h('giraffe', [
        h('ion-child')
      ]),
      childVNode: h('fish', [
        h('slot')
      ])
    }, (parentElm, childElm) => {
      expect(parentElm.childNodes.length).toBe(1);
      expect(parentElm.childNodes[0].nodeName).toBe('GIRAFFE');
      expect(parentElm.childNodes[0].childNodes.length).toBe(1);
      expect(parentElm.childNodes[0].childNodes[0].nodeName).toBe('ION-CHILD');
      expect(parentElm.childNodes[0].childNodes[0].childNodes.length).toBe(1);
      expect(parentElm.childNodes[0].childNodes[0].childNodes[0].nodeName).toBe('FISH');
      expect(parentElm.childNodes[0].childNodes[0].childNodes[0].childNodes.length).toBe(0);

      parentElm._render();
      childElm._render();
      parentElm._render();
      childElm._render();

      expect(parentElm.childNodes.length).toBe(1);
      expect(parentElm.childNodes[0].nodeName).toBe('GIRAFFE');
      expect(parentElm.childNodes[0].childNodes.length).toBe(1);
      expect(parentElm.childNodes[0].childNodes[0].nodeName).toBe('ION-CHILD');
      expect(parentElm.childNodes[0].childNodes[0].childNodes.length).toBe(1);
      expect(parentElm.childNodes[0].childNodes[0].childNodes[0].nodeName).toBe('FISH');
      expect(parentElm.childNodes[0].childNodes[0].childNodes[0].childNodes.length).toBe(0);

      done();
    });
  });

  it('should put parent content in child default slot', done => {
    mount({
      parentVNode: h('hippo', [
        h('ion-child', [
          h('aardvark', parentInstance.msg)
        ])
      ]),
      childVNode: h('slot')
    }, (parentElm, childElm) => {
      expect(parentElm.childNodes[0].nodeName).toBe('HIPPO');
      expect(parentElm.childNodes[0].childNodes[0].nodeName).toBe('ION-CHILD');
      expect(parentElm.childNodes[0].childNodes[0].childNodes[0].nodeName).toBe('AARDVARK');
      expect(parentElm.childNodes[0].childNodes[0].childNodes[0].textContent).toBe('parent message');

      parentElm._render();
      childElm._render();
      parentElm._render();
      childElm._render();

      expect(parentElm.childNodes[0].nodeName).toBe('HIPPO');
      expect(parentElm.childNodes[0].childNodes[0].nodeName).toBe('ION-CHILD');
      expect(parentElm.childNodes[0].childNodes[0].childNodes[0].nodeName).toBe('AARDVARK');
      expect(parentElm.childNodes[0].childNodes[0].childNodes[0].textContent).toBe('parent message');

      done();
    });
  });

  it('should put parent content in child nested default slot', done => {
    mount({
      parentVNode: h('badger', [
        h('ion-child', [
          h('dingo', parentInstance.msg)
        ])
      ]),
      childVNode: h('camel', [
        h('owl', [
          h('slot')
        ])
      ])
    }, (parentElm, childElm) => {
      expect(parentElm.childNodes[0].nodeName).toBe('BADGER');
      expect(parentElm.childNodes[0].childNodes[0].nodeName).toBe('ION-CHILD');
      expect(parentElm.childNodes[0].childNodes[0].childNodes[0].nodeName).toBe('CAMEL');
      expect(parentElm.childNodes[0].childNodes[0].childNodes[0].childNodes[0].nodeName).toBe('OWL');
      expect(parentElm.childNodes[0].childNodes[0].childNodes[0].childNodes[0].childNodes[0].nodeName).toBe('DINGO');
      expect(parentElm.childNodes[0].childNodes[0].childNodes[0].childNodes[0].childNodes[0].textContent).toBe('parent message');

      childElm._render();
      parentElm._render();
      childElm._render();
      parentElm._render();

      expect(parentElm.childNodes[0].nodeName).toBe('BADGER');
      expect(parentElm.childNodes[0].childNodes[0].nodeName).toBe('ION-CHILD');
      expect(parentElm.childNodes[0].childNodes[0].childNodes[0].nodeName).toBe('CAMEL');
      expect(parentElm.childNodes[0].childNodes[0].childNodes[0].childNodes[0].nodeName).toBe('OWL');
      expect(parentElm.childNodes[0].childNodes[0].childNodes[0].childNodes[0].childNodes[0].nodeName).toBe('DINGO');
      expect(parentElm.childNodes[0].childNodes[0].childNodes[0].childNodes[0].childNodes[0].textContent).toBe('parent message');

      done();
    });
  });

  it('should update parent content in child default slot', done => {

    mockDefine(plt, {
      tagNameMeta: 'ion-parent',
      componentModuleMeta: class {
        msg = 'parent message';

        render() {
          return h('cheetah', [
            h('ion-child', [
              h('bear', this.msg)
            ])
          ]);
        }
      }
    });

    mockDefine(plt, {
      tagNameMeta: 'ion-child',
      componentModuleMeta: class {
        render() {
          return h('chipmunk', [
            h('slot')
          ]);
        }
      }
    });

    const node = mockConnect(plt, '<ion-parent></ion-parent>');

    waitForLoad(plt, node, 'ion-parent').then(parentElm => {
      waitForLoad(plt, parentElm, 'ion-child').then(() => {

        expect(parentElm.childNodes[0].nodeName).toBe('CHEETAH');
        expect(parentElm.childNodes[0].childNodes[0].nodeName).toBe('ION-CHILD');
        expect(parentElm.childNodes[0].childNodes[0].childNodes[0].nodeName).toBe('CHIPMUNK');
        expect(parentElm.childNodes[0].childNodes[0].childNodes[0].childNodes[0].nodeName).toBe('BEAR');
        expect(parentElm.childNodes[0].childNodes[0].childNodes[0].childNodes[0].textContent).toBe('parent message');

        parentElm.$instance.msg = 'change 1';
        parentElm._render();

        expect(parentElm.childNodes[0].nodeName).toBe('CHEETAH');
        expect(parentElm.childNodes[0].childNodes[0].nodeName).toBe('ION-CHILD');
        expect(parentElm.childNodes[0].childNodes[0].childNodes[0].nodeName).toBe('CHIPMUNK');
        expect(parentElm.childNodes[0].childNodes[0].childNodes[0].childNodes[0].nodeName).toBe('BEAR');
        expect(parentElm.childNodes[0].childNodes[0].childNodes[0].childNodes[0].textContent).toBe('change 1');

        parentElm.$instance.msg = 'change 2';
        parentElm._render();

        expect(parentElm.childNodes[0].nodeName).toBe('CHEETAH');
        expect(parentElm.childNodes[0].childNodes[0].nodeName).toBe('ION-CHILD');
        expect(parentElm.childNodes[0].childNodes[0].childNodes[0].nodeName).toBe('CHIPMUNK');
        expect(parentElm.childNodes[0].childNodes[0].childNodes[0].childNodes[0].nodeName).toBe('BEAR');
        expect(parentElm.childNodes[0].childNodes[0].childNodes[0].childNodes[0].textContent).toBe('change 2');

        done();
      });
    });
  });

  it('should update parent content inner text in child nested default slot', done => {

    mockDefine(plt, {
      tagNameMeta: 'ion-parent',
      componentModuleMeta: class {
        msg = 'parent message';

        render() {
          return h('ion-child', [
            h('whale', this.msg)
          ]);
        }
      }
    });

    mockDefine(plt, {
      tagNameMeta: 'ion-child',
      componentModuleMeta: class {
        render() {
          return h('bull', [
            h('slot')
          ]);
        }
      }
    });

    const node = mockConnect(plt, '<ion-parent></ion-parent>');

    waitForLoad(plt, node, 'ion-parent').then(parentElm => {
      waitForLoad(plt, parentElm, 'ion-child').then(() => {
        expect(parentElm.childNodes[0].nodeName).toBe('ION-CHILD');
        expect(parentElm.childNodes[0].childNodes[0].nodeName).toBe('BULL');
        expect(parentElm.childNodes[0].childNodes[0].childNodes[0].nodeName).toBe('WHALE');
        expect(parentElm.childNodes[0].childNodes[0].childNodes[0].textContent).toBe('parent message');

        parentElm.$instance.msg = 'change 1';
        parentElm._render();

        expect(parentElm.childNodes[0].nodeName).toBe('ION-CHILD');
        expect(parentElm.childNodes[0].childNodes[0].nodeName).toBe('BULL');
        expect(parentElm.childNodes[0].childNodes[0].childNodes[0].nodeName).toBe('WHALE');
        expect(parentElm.childNodes[0].childNodes[0].childNodes[0].textContent).toBe('change 1');

        parentElm.$instance.msg = 'change 2';
        parentElm._render();

        expect(parentElm.childNodes[0].nodeName).toBe('ION-CHILD');
        expect(parentElm.childNodes[0].childNodes[0].nodeName).toBe('BULL');
        expect(parentElm.childNodes[0].childNodes[0].childNodes[0].nodeName).toBe('WHALE');
        expect(parentElm.childNodes[0].childNodes[0].childNodes[0].textContent).toBe('change 2');

        done();
      });
    });
  });

  it('should allow multiple slots with same name', done => {
    let values = 0;

    mockDefine(plt, {
      tagNameMeta: 'ion-parent',
      componentModuleMeta: class {
        render() {
          return h('ion-child', [
            h('falcon', { attrs: { slot: 'start' } }, ++values),
            h('eagle', { attrs: { slot: 'start' } }, ++values),
          ]);
        }
      }
    });

    mockDefine(plt, {
      tagNameMeta: 'ion-child',
      componentModuleMeta: class {
        render() {
          return h('mouse', [
            h('slot'),
            h('slot', { attrs: { name: 'start' } }),
            h('slot', { attrs: { name: 'end' } })
          ]);
        }
      }
    });

    const node = mockConnect(plt, '<ion-parent></ion-parent>');

    waitForLoad(plt, node, 'ion-parent').then(parentElm => {
      waitForLoad(plt, parentElm, 'ion-child').then(() => {
        expect(parentElm.childNodes[0].nodeName).toBe('ION-CHILD');
        expect(parentElm.childNodes[0].childNodes[0].nodeName).toBe('MOUSE');
        expect(parentElm.childNodes[0].childNodes[0].childNodes[0].nodeName).toBe('FALCON');
        expect(parentElm.childNodes[0].childNodes[0].childNodes[0].textContent).toBe('1');
        expect(parentElm.childNodes[0].childNodes[0].childNodes[1].nodeName).toBe('EAGLE');
        expect(parentElm.childNodes[0].childNodes[0].childNodes[1].textContent).toBe('2');

        parentElm._render();

        expect(parentElm.childNodes[0].nodeName).toBe('ION-CHILD');
        expect(parentElm.childNodes[0].childNodes[0].nodeName).toBe('MOUSE');
        expect(parentElm.childNodes[0].childNodes[0].childNodes[0].nodeName).toBe('FALCON');
        expect(parentElm.childNodes[0].childNodes[0].childNodes[0].textContent).toBe('3');
        expect(parentElm.childNodes[0].childNodes[0].childNodes[1].nodeName).toBe('EAGLE');
        expect(parentElm.childNodes[0].childNodes[0].childNodes[1].textContent).toBe('4');

        parentElm._render();

        expect(parentElm.childNodes[0].nodeName).toBe('ION-CHILD');
        expect(parentElm.childNodes[0].childNodes[0].nodeName).toBe('MOUSE');
        expect(parentElm.childNodes[0].childNodes[0].childNodes[0].nodeName).toBe('FALCON');
        expect(parentElm.childNodes[0].childNodes[0].childNodes[0].textContent).toBe('5');
        expect(parentElm.childNodes[0].childNodes[0].childNodes[1].nodeName).toBe('EAGLE');
        expect(parentElm.childNodes[0].childNodes[0].childNodes[1].textContent).toBe('6');

        done();
      });
    });

  });

  it('should only render nested named slots and default slot', done => {
    let values = 0;

    mockDefine(plt, {
      tagNameMeta: 'ion-parent',
      componentModuleMeta: class {
        render() {
          return h('ion-child', [
            h('butterfly', (++values).toString()),
            h('fox', { attrs: { slot: 'end' } }, ++values),
            h('ferret', { attrs: { slot: 'start' } }, ++values)
          ]);
        }
      }
    });

    mockDefine(plt, {
      tagNameMeta: 'ion-child',
      componentModuleMeta: class {
        render() {
          return h('flamingo', [
            h('slot', { attrs: { name: 'start' } }),
            h('horse', [
              h('slot'),
              h('bullfrog', [
                h('slot', { attrs: { name: 'end' } })
              ])
            ])
          ]);
        }
      }
    });

    const node = mockConnect(plt, '<ion-parent></ion-parent>');

    waitForLoad(plt, node, 'ion-parent').then(parentElm => {
      waitForLoad(plt, parentElm, 'ion-child').then(() => {

        expect(parentElm.childNodes[0].nodeName).toBe('ION-CHILD');
        expect(parentElm.childNodes[0].childNodes[0].nodeName).toBe('FLAMINGO');
        expect(parentElm.childNodes[0].childNodes[0].childNodes[0].nodeName).toBe('FERRET');
        expect(parentElm.childNodes[0].childNodes[0].childNodes[0].textContent).toBe('3');
        expect(parentElm.childNodes[0].childNodes[0].childNodes[1].nodeName).toBe('HORSE');
        expect(parentElm.childNodes[0].childNodes[0].childNodes[1].childNodes[0].nodeName).toBe('BUTTERFLY');
        expect(parentElm.childNodes[0].childNodes[0].childNodes[1].childNodes[0].textContent).toBe('1');
        expect(parentElm.childNodes[0].childNodes[0].childNodes[1].childNodes[1].nodeName).toBe('BULLFROG');
        expect(parentElm.childNodes[0].childNodes[0].childNodes[1].childNodes[1].childNodes[0].nodeName).toBe('FOX');
        expect(parentElm.childNodes[0].childNodes[0].childNodes[1].childNodes[1].childNodes[0].textContent).toBe('2');

        parentElm._render();

        expect(parentElm.childNodes[0].nodeName).toBe('ION-CHILD');
        expect(parentElm.childNodes[0].childNodes[0].nodeName).toBe('FLAMINGO');
        expect(parentElm.childNodes[0].childNodes[0].childNodes[0].nodeName).toBe('FERRET');
        expect(parentElm.childNodes[0].childNodes[0].childNodes[0].textContent).toBe('6');
        expect(parentElm.childNodes[0].childNodes[0].childNodes[1].nodeName).toBe('HORSE');
        expect(parentElm.childNodes[0].childNodes[0].childNodes[1].childNodes[0].nodeName).toBe('BUTTERFLY');
        expect(parentElm.childNodes[0].childNodes[0].childNodes[1].childNodes[0].textContent).toBe('4');
        expect(parentElm.childNodes[0].childNodes[0].childNodes[1].childNodes[1].nodeName).toBe('BULLFROG');
        expect(parentElm.childNodes[0].childNodes[0].childNodes[1].childNodes[1].childNodes[0].nodeName).toBe('FOX');
        expect(parentElm.childNodes[0].childNodes[0].childNodes[1].childNodes[1].childNodes[0].textContent).toBe('5');

        parentElm._render();

        expect(parentElm.childNodes[0].nodeName).toBe('ION-CHILD');
        expect(parentElm.childNodes[0].childNodes[0].nodeName).toBe('FLAMINGO');
        expect(parentElm.childNodes[0].childNodes[0].childNodes[0].nodeName).toBe('FERRET');
        expect(parentElm.childNodes[0].childNodes[0].childNodes[0].textContent).toBe('9');
        expect(parentElm.childNodes[0].childNodes[0].childNodes[1].nodeName).toBe('HORSE');
        expect(parentElm.childNodes[0].childNodes[0].childNodes[1].childNodes[0].nodeName).toBe('BUTTERFLY');
        expect(parentElm.childNodes[0].childNodes[0].childNodes[1].childNodes[0].textContent).toBe('7');
        expect(parentElm.childNodes[0].childNodes[0].childNodes[1].childNodes[1].nodeName).toBe('BULLFROG');
        expect(parentElm.childNodes[0].childNodes[0].childNodes[1].childNodes[1].childNodes[0].nodeName).toBe('FOX');
        expect(parentElm.childNodes[0].childNodes[0].childNodes[1].childNodes[1].childNodes[0].textContent).toBe('8');

        done();
      });
    });
  });

  it('should allow nested default slots', done => {
    let values = 0;

    mockDefine(plt, {
      tagNameMeta: 'ion-parent',
      componentModuleMeta: class {
        render() {
          return h('test-1', [
            h('test-2', [
              h('goat', (++values).toString())
            ])
          ]);
        }
      }
    });

    mockDefine(plt, {
      tagNameMeta: 'test-1',
      componentModuleMeta: class {
        render() {
          return h('seal', [
            h('slot')
          ]);
        }
      }
    });

    mockDefine(plt, {
      tagNameMeta: 'test-2',
      componentModuleMeta: class {
        render() {
          return h('goose', [
            h('slot')
          ]);
        }
      }
    });

    const node = mockConnect(plt, '<ion-parent></ion-parent>');

    waitForLoad(plt, node, 'ion-parent').then(elm => {
      waitForLoad(plt, elm, 'test-1').then(() => {
        waitForLoad(plt, elm, 'test-2').then(() => {

          expect(elm.childNodes[0].nodeName).toBe('TEST-1');
          expect(elm.childNodes[0].childNodes[0].nodeName).toBe('SEAL');
          expect(elm.childNodes[0].childNodes[0].childNodes[0].nodeName).toBe('TEST-2');
          expect(elm.childNodes[0].childNodes[0].childNodes[0].childNodes[0].nodeName).toBe('GOOSE');
          expect(elm.childNodes[0].childNodes[0].childNodes[0].childNodes[0].childNodes[0].nodeName).toBe('GOAT');
          expect(elm.childNodes[0].childNodes[0].childNodes[0].childNodes[0].childNodes[0].textContent).toBe('1');

          elm._render();

          expect(elm.childNodes[0].nodeName).toBe('TEST-1');
          expect(elm.childNodes[0].childNodes[0].nodeName).toBe('SEAL');
          expect(elm.childNodes[0].childNodes[0].childNodes[0].nodeName).toBe('TEST-2');
          expect(elm.childNodes[0].childNodes[0].childNodes[0].childNodes[0].nodeName).toBe('GOOSE');
          expect(elm.childNodes[0].childNodes[0].childNodes[0].childNodes[0].childNodes[0].nodeName).toBe('GOAT');
          expect(elm.childNodes[0].childNodes[0].childNodes[0].childNodes[0].childNodes[0].textContent).toBe('2');

          elm._render();

          expect(elm.childNodes[0].nodeName).toBe('TEST-1');
          expect(elm.childNodes[0].childNodes[0].nodeName).toBe('SEAL');
          expect(elm.childNodes[0].childNodes[0].childNodes[0].nodeName).toBe('TEST-2');
          expect(elm.childNodes[0].childNodes[0].childNodes[0].childNodes[0].nodeName).toBe('GOOSE');
          expect(elm.childNodes[0].childNodes[0].childNodes[0].childNodes[0].childNodes[0].nodeName).toBe('GOAT');
          expect(elm.childNodes[0].childNodes[0].childNodes[0].childNodes[0].childNodes[0].textContent).toBe('3');

          done();
        });
      });
    });
  });

  // // #4209
  // it('slot of multiple text nodes should not be infinitely merged', done => {
  //   const wrap = {
  //     template: `<inner ref="inner">foo<slot></slot></inner>`,
  //     components: {
  //       inner: {
  //         data: () => ({ a: 1 }),
  //         template: `<div>{{a}}<slot></slot></div>`
  //       }
  //     }
  //   }
  //   const vm = new Vue({
  //     template: `<wrap ref="wrap">bar</wrap>`,
  //     components: { wrap }
  //   }).$mount()

  //   expect(vm.$el.textContent).toBe('1foobar')
  //   vm.$refs.wrap.$refs.inner.a++
  //   waitForUpdate(() => {
  //     expect(vm.$el.textContent).toBe('2foobar')
  //   }).then(done)
  // })

  // it('the elements of slot should be updated correctly', done => {
  //   const vm = new Vue({
  //     data: { n: 1 },
  //     template: '<div><test><span v-for="i in n" :key="i">{{ i }}</span><input value="a"/></test></div>',
  //     components: {
  //       test: {
  //         template: '<div><slot></slot></div>'
  //       }
  //     }
  //   }).$mount()
  //   expect(vm.$el.innerHTML).toBe('<div><span>1</span><input value="a"></div>')
  //   const input = vm.$el.querySelector('input')
  //   input.value = 'b'
  //   vm.n++
  //   waitForUpdate(() => {
  //     expect(vm.$el.innerHTML).toBe('<div><span>1</span><span>2</span><input value="a"></div>')
  //     expect(vm.$el.querySelector('input')).toBe(input)
  //     expect(vm.$el.querySelector('input').value).toBe('b')
  //   }).then(done)
  // });

  const parentInstance = {
    msg: ''
  };

  beforeEach(() => {
    parentInstance.msg = 'parent message';
  });

  function mount(options: {parentVNode: VNode, childVNode: VNode}, done: (parentElm: HostElement, childElm: HostElement) => void) {

    mockDefine(plt, {
      tagNameMeta: 'ion-parent',
      componentModuleMeta: class {
        render() {
          return options.parentVNode;
        }
      }
    });

    mockDefine(plt, {
      tagNameMeta: 'ion-child',
      componentModuleMeta: class {
        render() {
          return options.childVNode;
        }
      }
    });

    const node = mockConnect(plt, '<ion-parent></ion-parent>');

    waitForLoad(plt, node, 'ion-parent').then(parentElm => {
      waitForLoad(plt, parentElm, 'ion-child').then(childElm => {
        done(parentElm, childElm);
      });
    });
  }

});