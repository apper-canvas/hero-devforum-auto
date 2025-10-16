import { getApperClient } from "@/services/apperClient";
import { toast } from "react-toastify";

export const questionService = {
  async getAll() {
    try {
      const apperClient = getApperClient();
      if (!apperClient) {
        throw new Error("ApperClient not initialized");
      }

const apperClient = getApperClient();
      
      if (!apperClient) {
        console.info('apper_info: ApperClient not initialized yet, skipping question fetch');
        return [];
      }

      const params = {
        fields: [
          { "field": { "Name": "Id" } },
          { "field": { "Name": "title_c" } },
          { "field": { "Name": "body_c" } },
          { "field": { "Name": "author_id_c" }, "referenceField": { "field": { "Name": "name_c" } } },
          { "field": { "Name": "author_name_c" } },
          { "field": { "Name": "author_reputation_c" } },
          { "field": { "Name": "tags_c" } },
          { "field": { "Name": "votes_c" } },
          { "field": { "Name": "views_c" } },
          { "field": { "Name": "answer_count_c" } },
          { "field": { "Name": "accepted_answer_id_c" } },
          { "field": { "Name": "CreatedOn" } },
          { "field": { "Name": "ModifiedOn" } }
        ],
        orderBy: [{ "fieldName": "CreatedOn", "sorttype": "DESC" }],
        pagingInfo: { "limit": 100, "offset": 0 }
      };

      const response = await apperClient.fetchRecords("question_c", params);

      if (!response.success) {
        console.error(`apper_info: Got an error in question getAll. The response body is: ${JSON.stringify(response)}.`);
        toast.error(response.message);
        return [];
      }

      if (!response.data || response.data.length === 0) {
        return [];
      }

      return response.data.map(question => ({
        Id: question.Id,
        id: question.Id.toString(),
        title: question.title_c || "",
        body: question.body_c || "",
        authorId: question.author_id_c?.Id || question.author_id_c || "",
        authorName: question.author_name_c || question.author_id_c?.Name || "Unknown",
        authorReputation: question.author_reputation_c || 0,
        tags: question.tags_c ? question.tags_c.split(',').map(t => t.trim()) : [],
        votes: question.votes_c || 0,
        views: question.views_c || 0,
        answerCount: question.answer_count_c || 0,
        acceptedAnswerId: question.accepted_answer_id_c?.Id || question.accepted_answer_id_c || null,
        createdAt: question.CreatedOn || new Date().toISOString(),
        updatedAt: question.ModifiedOn || new Date().toISOString()
      }));
    } catch (error) {
      console.error("apper_info: Got this error in question getAll. The error is:", error.message);
      toast.error("Failed to load questions");
      return [];
    }
  },

  async getById(id) {
    try {
      const apperClient = getApperClient();
      if (!apperClient) {
        throw new Error("ApperClient not initialized");
      }

const apperClient = getApperClient();
      
      if (!apperClient) {
        console.info('apper_info: ApperClient not initialized yet, skipping question fetch by ID');
        return null;
      }

      const params = {
        fields: [
          { "field": { "Name": "Id" } },
          { "field": { "Name": "title_c" } },
          { "field": { "Name": "body_c" } },
          { "field": { "Name": "author_id_c" }, "referenceField": { "field": { "Name": "name_c" } } },
          { "field": { "Name": "author_name_c" } },
          { "field": { "Name": "author_reputation_c" } },
          { "field": { "Name": "tags_c" } },
          { "field": { "Name": "votes_c" } },
          { "field": { "Name": "views_c" } },
          { "field": { "Name": "answer_count_c" } },
          { "field": { "Name": "accepted_answer_id_c" } },
          { "field": { "Name": "CreatedOn" } },
          { "field": { "Name": "ModifiedOn" } }
        ]
      };

      const response = await apperClient.getRecordById("question_c", parseInt(id), params);

      if (!response.success) {
        console.error(`apper_info: Got an error in question getById. The response body is: ${JSON.stringify(response)}.`);
        toast.error(response.message);
        throw new Error("Question not found");
      }

      if (!response.data) {
        throw new Error("Question not found");
      }

      const question = response.data;
      return {
        Id: question.Id,
        id: question.Id.toString(),
        title: question.title_c || "",
        body: question.body_c || "",
        authorId: question.author_id_c?.Id || question.author_id_c || "",
        authorName: question.author_name_c || question.author_id_c?.Name || "Unknown",
        authorReputation: question.author_reputation_c || 0,
        tags: question.tags_c ? question.tags_c.split(',').map(t => t.trim()) : [],
        votes: question.votes_c || 0,
        views: question.views_c || 0,
        answerCount: question.answer_count_c || 0,
        acceptedAnswerId: question.accepted_answer_id_c?.Id || question.accepted_answer_id_c || null,
        createdAt: question.CreatedOn || new Date().toISOString(),
        updatedAt: question.ModifiedOn || new Date().toISOString()
      };
    } catch (error) {
      console.error("apper_info: Got this error in question getById. The error is:", error.message);
      toast.error("Failed to load question");
      throw error;
    }
  },

  async create(questionData) {
    try {
      const apperClient = getApperClient();
      if (!apperClient) {
        throw new Error("ApperClient not initialized");
      }

      const params = {
        records: [
          {
            title_c: questionData.title,
            body_c: questionData.body,
            author_name_c: questionData.authorName,
            author_reputation_c: questionData.authorReputation || 0,
            tags_c: Array.isArray(questionData.tags) ? questionData.tags.join(',') : questionData.tags,
            votes_c: 0,
            views_c: 0,
            answer_count_c: 0
          }
        ]
      };

      const response = await apperClient.createRecord("question_c", params);

      if (!response.success) {
        console.error(`apper_info: Got an error in question create. The response body is: ${JSON.stringify(response)}.`);
        toast.error(response.message);
        throw new Error("Failed to create question");
      }

      if (response.results) {
        const successful = response.results.filter(r => r.success);
        const failed = response.results.filter(r => !r.success);

        if (failed.length > 0) {
          console.error(`apper_info: Failed to create ${failed.length} questions: ${JSON.stringify(failed)}`);
          failed.forEach(record => {
            if (record.message) toast.error(record.message);
          });
        }

        if (successful.length > 0) {
          toast.success("Question created successfully");
          const created = successful[0].data;
          return {
            Id: created.Id,
            id: created.Id.toString(),
            title: created.title_c || "",
            body: created.body_c || "",
            authorId: created.author_id_c?.Id || created.author_id_c || "",
            authorName: created.author_name_c || "",
            authorReputation: created.author_reputation_c || 0,
            tags: created.tags_c ? created.tags_c.split(',').map(t => t.trim()) : [],
            votes: created.votes_c || 0,
            views: created.views_c || 0,
            answerCount: created.answer_count_c || 0,
            acceptedAnswerId: null,
            createdAt: created.CreatedOn || new Date().toISOString(),
            updatedAt: created.ModifiedOn || new Date().toISOString()
          };
        }
      }

      throw new Error("Failed to create question");
    } catch (error) {
      console.error("apper_info: Got this error in question create. The error is:", error.message);
      toast.error("Failed to create question");
      throw error;
    }
  }
};