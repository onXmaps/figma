const { widget } = figma;
const { AutoLayout, Text, useSyncedState, usePropertyMenu, useEffect, Rectangle } = widget;

interface Attribute {
  name: string;
  type: string;
  nullable?: boolean;
  key?: 'primary' | 'foreign' | null;
}

function Table() {
  const [attributes, setAttributes] = useSyncedState<string[]>('attributes', ["id"]);
  usePropertyMenu(
    [
      {
        tooltip: 'Edit',
        propertyName: 'edit',
        itemType: 'action',
      },
    ],
    ({ propertyName }) => {
      if (propertyName === 'edit') {
        figma.showUI(`
        <div id="attributes"></div>
        <button id="add">add</button>
        <button id="update">update</button>
        <script>
          const attributes = [${attributes.map(a => `"${a.replace(/"|'/g, '')}"`).join()}];
          const listeners = [];
          const container = document.getElementById("attributes");
          const editor = document.getElementById("editor");
          const update = document.getElementById("update");
          const add = document.getElementById("add");
          
          const onRemoveClicked = (e) => {
            let el = e.target.parentElement;
            const index = [...el.parentElement.children].indexOf(el);
            attributes.splice(index, 1);
            renderAttributes();
          };
          
          const onValueChange = (e) => {
            let el = e.target.parentElement;
            const index = [...el.parentElement.children].indexOf(el);
            attributes[index] = e.target.value;
          };

          function makeAttribute(name = '') {
            const node = document.createElement("span");
            const input = document.createElement("input");
            input.setAttribute('type', 'text');
            input.setAttribute('placeholder', "[name]");
            input.setAttribute('value', name);
            input.addEventListener('input', onValueChange);

            node.appendChild(input);
            
            const btn = document.createElement("button");
            btn.innerHTML = 'remove';
            btn.addEventListener('click', onRemoveClicked);
            node.appendChild(btn);
            return node;
          }

          function renderAttributes() {
            while (container.firstChild) {
              container.firstChild.children[0].removeEventListener('input', onValueChange);
              container.firstChild.children[1].removeEventListener('click', onRemoveClicked);
              container.removeChild(container.firstChild);
            }
            for (let i = 0; i < attributes.length; i++) {
              container.appendChild(makeAttribute(attributes[i]));
            }
          }

          function addAttribute() {
            attributes.push("");
            renderAttributes();
          }
          
          update.addEventListener("click", () => {
            parent.postMessage({ pluginMessage: '{"command": "set_attributes", "args": ' + JSON.stringify(attributes) + '}' }, '*');
          });
          
          add.addEventListener("click", () => {
            addAttribute();
          });
          
          renderAttributes();
        </script>
      `)
        return new Promise<void>(() => {})
      }
    },
  )

  useEffect(() => {
    figma.ui.onmessage = (message: string) => {
      try {
        let {command = "", args = []} = JSON.parse(message);
        console.log(command);
        switch (command) {
          case "set_attributes": {
            setAttributes([...args]);
          }
        }
      } catch (e) {
        console.log(e);
      }
    }
  })

  return (
    <AutoLayout
    direction="vertical"
    horizontalAlignItems="center"
    verticalAlignItems="center"
    height="hug-contents"
    padding={8}
    fill="#FFFFFF"
    spacing={12}
    effect={{
      type: 'drop-shadow',
      color: { r: 0, g: 0, b: 0, a: 0.2 },
      offset: { x: 0, y: 0 },
      blur: 2,
      spread: 2,
    }}
  >
        {attributes.map((attribute, idx) => {
          return attribute ? (
            <AutoLayout direction="horizontal" horizontalAlignItems="start" verticalAlignItems="start"  key={idx}>
              <Text
                fontSize={12}
                horizontalAlignText="left"
                width="fill-parent"
              >
                {attribute}
              </Text>
            </AutoLayout>
          ) : null
        })}
    </AutoLayout>
  )
}
widget.register(Table)