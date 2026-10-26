import { aiService } from '../services/aiService.js';

/**
 * Controller to handle AI task description generation.
 * Endpoint: POST /api/ai/generate-description
 */
export const generateTaskDescription = async (req, res) => {
  try {
    const { title } = req.body;

    if (!title || typeof title !== 'string' || !title.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Task title is required and must be a non-empty string.',
      });
    }

    const trimmedTitle = title.trim();

    if (trimmedTitle.length > 300) {
      return res.status(400).json({
        success: false,
        message: 'Task title exceeds maximum allowed limit of 300 characters.',
      });
    }

    const description = await aiService.generateDescription(trimmedTitle);

    return res.status(200).json({
      success: true,
      description,
    });
  } catch (error) {
    // Avoid logging sensitive API keys or credentials
    console.error('[AIController] Error generating description:', error.message);

    const statusCode = error.statusCode || 500;
    return res.status(statusCode).json({
      success: false,
      message: error.message || 'An unexpected error occurred while generating the description.',
    });
  }
};
