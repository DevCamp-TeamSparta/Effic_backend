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

    // 같은 title이 있으면 에러
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

    // 이미 멤버가 있는지 확인
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
    const PhonebookList = await this.entityManager.find('PhonebookList', {
      where: {
        userId: userId,
      },
    });

    return PhonebookList;
  }

  // 주소록 멤버 삭제
  async deletePhonebookMember(userId: number, phonebookId: number, contactId) {
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
}
