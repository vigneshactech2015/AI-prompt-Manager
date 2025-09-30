const Prompt = require('../models/Prompt');

const getReport = async (req, res) => {
    try {
        // 1. Most Viewed Prompts by Tool Type
        const mostViewedByTool = await Prompt.aggregate([
            {
                $group: {
                    _id: "$aiTool",
                    totalViews: { $sum: "$viewCount" },
                    prompts: {
                        $push: {
                            title: "$title",
                            description: "$description",
                            viewCount: "$viewCount",
                            promptId: "$_id"
                        }
                    }
                }
            },
            {
                $sort: { totalViews: -1 }
            },
            {
                $project: {
                    aiTool: "$_id",
                    totalViews: 1,
                    topPrompts: {
                        $slice: [
                            {
                                $sortArray: {
                                    input: "$prompts",
                                    sortBy: { viewCount: -1 }
                                }
                            },
                            5 // Top 5 prompts per tool
                        ]
                    }
                }
            }
        ]);

        // 2. Most Favorited Prompts (Global)
        const mostFavoritedPrompts = await Prompt.find()
            .sort({ favoriteCount: -1 })
            .limit(10)
            .select('title description aiTool favoriteCount userId createdAt');

        // 3. Most Copied Prompts (Global)
        const mostCopiedPrompts = await Prompt.find()
            .sort({ copyCount: -1 })
            .limit(10)
            .select('title description aiTool copyCount userId createdAt');

        // 4. Overall Statistics
        const overallStats = await Prompt.aggregate([
            {
                $group: {
                    _id: null,
                    totalPrompts: { $sum: 1 },
                    totalViews: { $sum: "$viewCount" },
                    totalCopies: { $sum: "$copyCount" },
                    totalFavorites: { $sum: "$favoriteCount" },
                    avgViews: { $avg: "$viewCount" },
                    avgCopies: { $avg: "$copyCount" },
                    avgFavorites: { $avg: "$favoriteCount" }
                }
            }
        ]);

        // 5. Tool-wise Statistics
        const toolStats = await Prompt.aggregate([
            {
                $group: {
                    _id: "$aiTool",
                    promptCount: { $sum: 1 },
                    totalViews: { $sum: "$viewCount" },
                    totalCopies: { $sum: "$copyCount" },
                    totalFavorites: { $sum: "$favoriteCount" },
                    avgViews: { $avg: "$viewCount" },
                    avgCopies: { $avg: "$copyCount" },
                    avgFavorites: { $avg: "$favoriteCount" }
                }
            },
            {
                $sort: { totalViews: -1 }
            }
        ]);

        const reportData = {
            mostViewedByTool,
            mostFavoritedPrompts,
            mostCopiedPrompts,
            overallStats: overallStats[0] || {},
            toolStats,
            generatedAt: new Date(),
            summary: {
                totalTools: toolStats.length,
                topPerformingTool: toolStats[0]?._id || 'N/A',
                mostPopularPrompt: mostViewedByTool[0]?.topPrompts[0]?.title || 'N/A'
            }
        };

        return res.status(200).json({
            data: reportData,
            message: 'Analytics report generated successfully'
        });

    } catch (err) {
        console.log('Error in fetching report', err);
        return res.status(500).json({
            data: { message: 'Unable to fetch the report' }
        });
    }
};


module.exports = { 
    getReport
};