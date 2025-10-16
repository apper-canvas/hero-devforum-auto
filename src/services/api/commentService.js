import { getApperClient } from '@/services/apperClient';

export const commentService = {
async getByTargetId(targetType, targetId) {
    try {
      const apperClient = getApperClient();
      
      const response = await apperClient.fetchRecords('comment_c', {
        fields: [
          { field: { Name: "Id" } },
          { field: { Name: "content_c" } },
          { field: { Name: "targetType_c" } },
          { field: { Name: "targetId_c" } },
          { field: { Name: "targetUserId_c" } },
          { field: { Name: "parentCommentId_c" } },
          { field: { Name: "CreatedOn" } },
          { field: { Name: "ModifiedOn" } }
        ],
        where: [
          {
            FieldName: "targetType_c",
            Operator: "EqualTo",
            Values: [targetType]
          },
          {
            FieldName: "targetId_c",
            Operator: "EqualTo",
            Values: [parseInt(targetId)]
          }
        ],
        orderBy: [{ fieldName: "CreatedOn", sorttype: "ASC" }]
      });

      if (!response.success) {
        console.error(response.message);
        return [];
      }

      return (response.data || []).map(comment => ({
        Id: comment.Id,
        id: comment.Id.toString(),
        content: comment.content_c || '',
        targetType: comment.targetType_c || targetType,
        targetId: comment.targetId_c || parseInt(targetId),
        userId: comment.targetUserId_c || null,
        parentId: comment.parentCommentId_c || null,
        createdAt: comment.CreatedOn || new Date().toISOString(),
        updatedAt: comment.ModifiedOn || new Date().toISOString()
      }));
    } catch (error) {
      console.error("Error fetching comments:", error?.message || error);
      return [];
    }
  },

async create(commentData) {
    try {
      const apperClient = getApperClient();
      
      const payload = {
        records: [
          {
            content_c: commentData.content || '',
            targetType_c: commentData.targetType || '',
            targetId_c: parseInt(commentData.targetId) || 0,
            targetUserId_c: parseInt(commentData.userId) || null,
            parentCommentId_c: commentData.parentId ? parseInt(commentData.parentId) : null
          }
        ]
      };

      const response = await apperClient.createRecord('comment_c', payload);

      if (!response.success) {
        console.error(response.message);
        throw new Error(response.message);
      }

      if (response.results && response.results.length > 0) {
        const result = response.results[0];
        if (!result.success) {
          const errorMsg = result.message || 'Failed to create comment';
          console.error(errorMsg);
          throw new Error(errorMsg);
        }

        const createdComment = result.data;
        return {
          Id: createdComment.Id,
          id: createdComment.Id.toString(),
          content: createdComment.content_c || '',
          targetType: createdComment.targetType_c || commentData.targetType,
          targetId: createdComment.targetId_c || parseInt(commentData.targetId),
          userId: createdComment.targetUserId_c || commentData.userId,
          parentId: createdComment.parentCommentId_c || null,
          createdAt: createdComment.CreatedOn || new Date().toISOString(),
          updatedAt: createdComment.ModifiedOn || new Date().toISOString()
        };
      }

      throw new Error('No result returned from create operation');
    } catch (error) {
      console.error("Error creating comment:", error?.message || error);
      throw error;
    }
  },

async delete(id) {
    try {
      const apperClient = getApperClient();
      const commentId = parseInt(id);

      // First, fetch all child comments (replies)
      const childResponse = await apperClient.fetchRecords('comment_c', {
        fields: [{ field: { Name: "Id" } }],
        where: [
          {
            FieldName: "parentCommentId_c",
            Operator: "EqualTo",
            Values: [commentId]
          }
        ]
      });

      // Delete all child comments first
      if (childResponse.success && childResponse.data && childResponse.data.length > 0) {
        const childIds = childResponse.data.map(c => c.Id);
        const deleteChildResponse = await apperClient.deleteRecord('comment_c', {
          RecordIds: childIds
        });

        if (!deleteChildResponse.success) {
          console.error('Failed to delete child comments:', deleteChildResponse.message);
        }
      }

      // Now delete the parent comment
      const response = await apperClient.deleteRecord('comment_c', {
        RecordIds: [commentId]
      });

      if (!response.success) {
        console.error(response.message);
        throw new Error(response.message);
      }

      if (response.results && response.results.length > 0) {
        const result = response.results[0];
        if (!result.success) {
          const errorMsg = result.message || 'Failed to delete comment';
          console.error(errorMsg);
          throw new Error(errorMsg);
        }
      }

      return { success: true };
    } catch (error) {
      console.error("Error deleting comment:", error?.message || error);
      throw error;
    }
  }
};