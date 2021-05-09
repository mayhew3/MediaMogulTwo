import {ArrayUtil} from '../../src/app/utility/ArrayUtil';
import _ from 'underscore';

const clients = [];
const persons = [];

const globalChannels = [
  'odds',
  'voting'
];

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const personalChannels = [
  'winner'
];

let io;

export const initIO = (in_io: Record<string, any>): void => {
  io = in_io;
  io.on('connection', (client) => {
    console.log('Connection established. Adding client.');
    clients.push(client);

    const person_id_str = client.handshake.query.person_id;

    let person_id;
    if (!!person_id_str) {
      person_id = +person_id_str;
      addClientForPerson(person_id, client);
    }

    initAllRooms(client);

    client.on('disconnect', () => {
      console.log('Client disconnected. Removing from array.');
      ArrayUtil.removeFromArray(clients, client);

      if (!!person_id) {
        removeClientForPerson(person_id, client);
      }
    });
  });

};

const initAllRooms = (client): void => {
  initGlobalChannels(client);
};

const initGlobalChannels = (client: Record<string, any>): void => {
  _.each(globalChannels, channelName => {
    client.on(channelName, msg => {
      console.log(`Message received on channel ${channelName} to everyone.`);
      io.emit(channelName, msg);
    });
  });
};

/* API */

export const emitToAll = (channel: Record<string, any>, msg: Record<string, any>): void => {
  io.emit(channel, msg);
};

export const emitToAllExceptPerson = (person_id: number, channel: string, msg: Record<string, any>): void => {
  const clientsForEveryoneExceptPerson = getClientsForEveryoneExceptPerson(person_id);
  emitToClients(clientsForEveryoneExceptPerson, channel, msg);
};


/* PRIVATE METHODS */

const addClientForPerson = (person_id, client): void => {
  const existingArray = _.findWhere(persons, {person_id});
  if (!existingArray) {
    persons.push({
      person_id,
      clients: [client]
    });
  } else {
    existingArray.clients.push(client);
  }
};

const removeClientForPerson = (person_id, client): void => {
  const existingArray = _.findWhere(persons, {person_id});
  if (!existingArray) {
    console.log('Warning: Disconnect received for person_id that never connected: ' + person_id);
  } else {
    ArrayUtil.removeFromArray(existingArray.clients, client);
  }
};

const getClientsForEveryoneExceptPerson = (person_id): any[] => {
  const otherPersons = _.filter(persons, person => person_id !== person.person_id);
  const cs = [];
  _.each(otherPersons, person => ArrayUtil.addToArray(cs, person.clients));
  return cs;
};

const emitToClients = (cs, channel, msg): void => {
  _.each(cs, client => {
    client.emit(channel, msg);
  });
};
