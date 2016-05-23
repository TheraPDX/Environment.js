# Environment.js

Environments are smart interelationships between IoT devices. Simply put, environments contain Things and Rules.

Things: see thing.js
Rules: relationships between the things. Rules are listeners for events that come from the things in the room.

For example:

```javascript
import Environment from 'Environment.js';

const env = new Environmnet({
  name: 'room',
  things:  [], // a list of thing objects
  rules: [
    {
      name: "Check light data",
      on: 'light_data', // The event to listen for.
      function: (data) => {
        if (data < 70) {
          this.LED.callAction('light_on');
        }
      }
    }
  ]
});


```
