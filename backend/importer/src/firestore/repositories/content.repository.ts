import { BaseRepository } from "../base.repository.js";

export class ContentRepository extends BaseRepository {

  async getById(id: string) {
    const doc = await this.collection("content").doc(id).get();

    return doc.exists ? doc.data() : null;
  }

}