import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import {
  PhonebookListRepository,
  AllContactsRepository,
} from '../phonebook.repository';
import { InjectEntityManager } from '@nestjs/typeorm';
import { EntityManager } from 'typeorm';
import { AllContacts } from '../phonebook.entity';

@Injectable()
export class PhonebookService {
  constructor(
    private readonly phonebookListRepository: PhonebookListRepository,
    private readonly allContactsRepository: AllContactsRepository,
    @InjectEntityManager() private readonly entityManager: EntityManager,
  ) {}

  // 주소록 생성
  async createPhonebook(userId: number, createPhonebookDto) {
    const { title, members } = createPhonebookDto;

    const Phonebook = await this.entityManager.findOne('PhonebookList', {
      where: {
        userId: userId,
        title: title,
      },
    });

    if (Phonebook) {
      throw new HttpException(
        'Phonebook already exists',
        HttpStatus.BAD_REQUEST,
      );
    }

    const memberList = [];
    for (let i = 0; i < members.length; i++) {
      const Contact =
        await this.allContactsRepository.findOneByUserIdAndNameAndPhoneNumber(
          userId,
          members[i].name,
          members[i].number,
        );

      if (!Contact) {
        const newContact = new AllContacts();
        newContact.name = members[i].name;
        newContact.number = members[i].number;
        newContact.userId = userId;

        await this.entityManager.save(newContact);
        memberList.push(newContact.contactId);
      } else {
        memberList.push(Contact.contactId);
      }
    }

    const PhonebookList = this.entityManager.create('PhonebookList', {
      title: title,
      members: memberList,
      userId: userId,
      createdAt: new Date(),
    });

    await this.entityManager.save(PhonebookList);

    return PhonebookList;
  }

  // 주소록 멤버 수정
  async updatePhonebook(
    userId: number,
    phonebookId: number,
    contactId: number,
    updatePhonebookDto,
  ) {
    const contact = await this.entityManager.findOne('AllContacts', {
      where: {
        contactId: contactId,
        userId: userId,
      },
    });

    if (!contact) {
      throw new HttpException('Contact not found', HttpStatus.NOT_FOUND);
    }

    const Phonebook = await this.phonebookListRepository.findOneByPhonebookId(
      phonebookId,
    );

    if (!Phonebook) {
      throw new HttpException('Phonebook not found', HttpStatus.NOT_FOUND);
    }

    const { name, number } = updatePhonebookDto;

    const Contact = await this.allContactsRepository.findOneByContactId(
      contactId,
    );

    if (name && number) {
      Contact.name = name;
      Contact.number = number;
    } else if (name) {
      Contact.name = name;
    } else if (number) {
      Contact.number = number;
    } else {
      throw new HttpException(
        'Name or number is not provided',
        HttpStatus.BAD_REQUEST,
      );
    }

    await this.entityManager.save(Contact);

    Phonebook.updatedAt = new Date();

    await this.entityManager.save(Phonebook);

    return Contact;
  }

  // 주소록 목록 조회
  async findphonebookList(userId: number) {
    const PhonebookList = await this.phonebookListRepository.findAllByUserId(
      userId,
    );

    if (!PhonebookList) {
      throw new HttpException('Phonebook not found', HttpStatus.NOT_FOUND);
    }

    const result = [];
    for (let i = 0; i < PhonebookList.length; i++) {
      const members = PhonebookList[i].members.length;
      const phonebook = {
        phonebookId: PhonebookList[i].phonebookId,
        title: PhonebookList[i].title,
        membersAmount: members,
        createdAt: PhonebookList[i].createdAt,
        updatedAt: PhonebookList[i].updatedAt,
        userId: PhonebookList[i].userId,
      };
      result.push(phonebook);
    }

    return result;
  }

  // 주소록 멤버 조회
  async findPhonebookMember(userId: number, phonebookId: number) {
    const Phonebook =
      await this.phonebookListRepository.findOneByPhonebookIdAndUserId(
        phonebookId,
        userId,
      );

    if (!Phonebook) {
      throw new HttpException('Phonebook not found', HttpStatus.NOT_FOUND);
    }

    const result = [];
    const memberInfoList = [];
    for (let i = 0; i < Phonebook.members.length; i++) {
      const Contact = await this.allContactsRepository.findOneByContactId(
        Phonebook.members[i],
      );
      const member = {
        contactId: Contact.contactId,
        name: Contact.name,
        number: Contact.number,
      };
      memberInfoList.push(member);
    }
    result.push({
      phonebookId: Phonebook.phonebookId,
      title: Phonebook.title,
      createdAt: Phonebook.createdAt,
      updatedAt: Phonebook.updatedAt,
      userId: Phonebook.userId,
      memberInfo: memberInfoList,
    });
    return result;
  }

  // 주소록 멤버 삭제
  async deletePhonebookMember(
    userId: number,
    phonebookId: number,
    contactId: number,
  ) {
    const Phonebook =
      await this.phonebookListRepository.findOneByPhonebookIdAndUserId(
        phonebookId,
        userId,
      );

    if (!Phonebook) {
      throw new HttpException('Phonebook not found', HttpStatus.NOT_FOUND);
    }

    const Contact = await this.allContactsRepository.findOneByContactId(
      contactId,
    );

    if (!Contact) {
      throw new HttpException('Contact not found', HttpStatus.NOT_FOUND);
    }

    const index = Phonebook.members.indexOf(contactId);

    if (index > -1) {
      Phonebook.members.splice(index, 1);
      Phonebook.updatedAt = new Date();
    }

    const renewPhonebook = await this.entityManager.save(Phonebook);

    return renewPhonebook;
  }

  // 주소록 title 수정
  async updatePhonebookTitle(
    userId: number,
    phonebookId: number,
    title: string,
  ) {
    const Phonebook =
      await this.phonebookListRepository.findOneByPhonebookIdAndUserId(
        phonebookId,
        userId,
      );

    if (!Phonebook) {
      throw new HttpException('Phonebook not found', HttpStatus.NOT_FOUND);
    }

    Phonebook.title = title;
    Phonebook.updatedAt = new Date();

    await this.entityManager.save(Phonebook);

    return Phonebook;
  }

  // 주소록 멤버 추가
  async addPhonebookMember(
    userId: number,
    phonebookId: number,
    addPhonebookMemberDto,
  ) {
    const Phonebook =
      await this.phonebookListRepository.findOneByPhonebookIdAndUserId(
        phonebookId,
        userId,
      );

    if (!Phonebook) {
      throw new HttpException('Phonebook not found', HttpStatus.NOT_FOUND);
    }

    const { addMembers } = addPhonebookMemberDto;

    const memberList = [];
    for (let i = 0; i < addMembers.length; i++) {
      const Contact =
        await this.allContactsRepository.findOneByUserIdAndNameAndPhoneNumber(
          userId,
          addMembers[i].name,
          addMembers[i].number,
        );

      if (!Contact) {
        const newContact = new AllContacts();
        newContact.name = addMembers[i].name;
        newContact.number = addMembers[i].number;
        newContact.userId = userId;

        await this.entityManager.save(newContact);
        memberList.push(newContact.contactId);
      } else {
        memberList.push(Contact.contactId);
      }
    }

    const newMemberList = Phonebook.members.concat(memberList);
    const uniqueMemberList = newMemberList.filter(
      (item, index) => newMemberList.indexOf(item) === index,
    );

    Phonebook.members = uniqueMemberList;
    Phonebook.updatedAt = new Date();

    await this.entityManager.save(Phonebook);

    return Phonebook;
  }
}
