import {MyGameAddedMessage} from './MyGameAddedMessage';

export interface ServerToClientEvents {
  my_game_added: (msg: MyGameAddedMessage) => void;
}

export interface ClientToServerEvents {}
