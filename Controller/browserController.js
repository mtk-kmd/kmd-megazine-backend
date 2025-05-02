const UAParser = require('ua-parser-js');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

exports.trackBrowser = (req, res) => {
  const userAgent = req.headers['user-agent'] || '';
  const parser = new UAParser(userAgent);
  const browser = parser.getBrowser();
  res.json({
    result: parser.getResult(),
  });
};

exports.getBrowserUsages = async (req, res) => {
  try {
    const browserUsages = await prisma.browserTracking.groupBy({
      by: ['browser_name', 'browser_version', 'user_id'],
      _count: {
        browser_name: true,
        user_id: true,
      },
      orderBy: {
        _count: {
          browser_name: 'desc',
        },
      },
    });

    const browserUsagesWithPercentage = browserUsages.map((usage) => {
      const totalUsages = browserUsages.reduce(
        (sum, usage) => sum + usage._count.browser_name,
        0
      );
      const percentage = (usage._count.browser_name / totalUsages) * 100;
      return {
        ...usage,
        percentage: percentage.toFixed(2) + '%',
      }
    });

    const userIds = [...new Set(browserUsages
      .filter(usage => usage.user_id != null)
      .map(usage => usage.user_id)
    )];

    const userInfo = await prisma.user.findMany({
      where: {
        user_id: {
          in: userIds,
        },
      },
      select: {
        user_id: true,
        user_name: true,
      },
    });

    const browserUsageByUser = browserUsagesWithPercentage.map((usage) => {
      const user = userInfo.find((user) => user.user_id === usage.user_id);
      return {
       ...usage,
        user: user? user.user_name : 'Unknown',
      };
    });

    const browserUsageByUserWithPercentage = browserUsageByUser.map((usage) => {
      const totalUsages = browserUsageByUser.reduce(
        (sum, usage) => sum + usage._count.browser_name,
        0
      );
      const percentage = (usage._count.browser_name / totalUsages) * 100;
      return {
       ...usage,
        percentage: percentage.toFixed(2) + '%',
      }
    });

    res.json({
      browserUsages,
      browserUsagesWithPercentage,
      browserUsageByUser,
      browserUsageByUserWithPercentage
    });
  } catch (error) {
    console.error('Error fetching browser usages:', error);
    res.status(500).json({
      error: 'Internal Server Error',
    });
  }
}
