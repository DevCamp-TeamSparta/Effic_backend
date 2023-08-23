// import {
//   Entity,
//   Column,
//   PrimaryGeneratedColumn,
//   OneToOne,
//   JoinColumn,
// } from 'typeorm';
// import { Message } from './message.entity';

// @Entity()
// export class MessageContent {
//   @PrimaryGeneratedColumn({ type: 'int' })
//   contentId: number;

//   @Column()
//   messageId: number;

//   @Column()
//   content: string;

//   @Column()
//   receiverList: string[];

//   //   @OneToOne(() => Message, (message) => message.content)
//   //   @JoinColumn({ name: 'messageId' })
//   //   message: Message;
// }
