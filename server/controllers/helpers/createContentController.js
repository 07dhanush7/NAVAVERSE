const buildImagePath = (file) => (file ? `/uploads/${file.filename}` : "");

const createContentController = ({ label, Model }) => {
  const isOwnerOrAdmin = (item, req) => {
    if (req.admin) {
      return true;
    }

    if (!req.user?._id || !item.createdBy) {
      return false;
    }

    return item.createdBy.toString() === req.user._id.toString();
  };

  const createItem = async (req, res) => {
    try {
      const isAdminPost = Boolean(req.admin);

      const item = await Model.create({
        ...req.body,
        image: buildImagePath(req.file),
        createdBy: req.user?._id || null,
        status: isAdminPost ? "approved" : "pending",
        reviewedBy: isAdminPost ? req.admin?.id : null,
        isAdminPost,
      });

      return res.status(201).json({
        success: true,
        message: isAdminPost
          ? `${label} created successfully`
          : "Your submission is under admin review",
        item,
      });
    } catch (error) {
      console.error(`Create ${label} error:`, error);
      return res.status(500).json({
        success: false,
        message: `Failed to create ${label.toLowerCase()}`,
      });
    }
  };

  const getPublicItems = async (req, res) => {
    try {
      const limit = Number(req.query.limit) || 0;
      const query = Model.find({ status: "approved" }).sort({ createdAt: -1 });

      if (limit > 0) {
        query.limit(limit);
      }

      const items = await query;

      return res.status(200).json({
        success: true,
        items,
      });
    } catch (error) {
      console.error(`Get public ${label} error:`, error);
      return res.status(500).json({
        success: false,
        message: `Failed to fetch ${label.toLowerCase()}s`,
      });
    }
  };

  const getPublicItemById = async (req, res) => {
    try {
      const item = await Model.findOne({
        _id: req.params.id,
        status: "approved",
      }).populate("createdBy", "username profileImage");

      if (!item) {
        return res.status(404).json({
          success: false,
          message: `${label} not found`,
        });
      }

      return res.status(200).json({
        success: true,
        item,
      });
    } catch (error) {
      console.error(`Get ${label} detail error:`, error);
      return res.status(500).json({
        success: false,
        message: `Failed to fetch ${label.toLowerCase()}`,
      });
    }
  };

  const getUserItems = async (req, res) => {
    try {
      const items = await Model.find({ createdBy: req.user._id }).sort({ createdAt: -1 });

      return res.status(200).json({
        success: true,
        items,
      });
    } catch (error) {
      console.error(`Get user ${label} error:`, error);
      return res.status(500).json({
        success: false,
        message: `Failed to fetch your ${label.toLowerCase()}s`,
      });
    }
  };

  const getAdminItems = async (req, res) => {
    try {
      const items = await Model.find()
        .populate("createdBy", "username email")
        .sort({ createdAt: -1 });

      return res.status(200).json({
        success: true,
        items,
      });
    } catch (error) {
      console.error(`Get admin ${label} error:`, error);
      return res.status(500).json({
        success: false,
        message: `Failed to fetch ${label.toLowerCase()}s`,
      });
    }
  };

  const getPendingItems = async (req, res) => {
    try {
      const items = await Model.find({ status: "pending" })
        .populate("createdBy", "username email")
        .sort({ createdAt: -1 });

      return res.status(200).json({
        success: true,
        items,
      });
    } catch (error) {
      console.error(`Get pending ${label} error:`, error);
      return res.status(500).json({
        success: false,
        message: `Failed to fetch pending ${label.toLowerCase()}s`,
      });
    }
  };

  const updateItem = async (req, res) => {
    try {
      const item = await Model.findById(req.params.id);

      if (!item) {
        return res.status(404).json({
          success: false,
          message: `${label} not found`,
        });
      }

      if (!isOwnerOrAdmin(item, req)) {
        return res.status(403).json({
          success: false,
          message: `Not authorized to update this ${label.toLowerCase()}`,
        });
      }

      Object.assign(item, req.body);

      if (req.file) {
        item.image = buildImagePath(req.file);
      }

      if (req.admin) {
        item.status = "approved";
        item.isAdminPost = true;
        item.reviewedBy = req.admin.id;
        item.rejectionReason = "";
      } else {
        item.status = "pending";
        item.reviewedBy = null;
        item.rejectionReason = "";
      }

      await item.save();

      return res.status(200).json({
        success: true,
        message: `${label} updated successfully`,
        item,
      });
    } catch (error) {
      console.error(`Update ${label} error:`, error);
      return res.status(500).json({
        success: false,
        message: `Failed to update ${label.toLowerCase()}`,
      });
    }
  };

  const deleteItem = async (req, res) => {
    try {
      const item = await Model.findById(req.params.id);

      if (!item) {
        return res.status(404).json({
          success: false,
          message: `${label} not found`,
        });
      }

      if (!isOwnerOrAdmin(item, req)) {
        return res.status(403).json({
          success: false,
          message: `Not authorized to delete this ${label.toLowerCase()}`,
        });
      }

      await Model.findByIdAndDelete(req.params.id);

      return res.status(200).json({
        success: true,
        message: `${label} deleted successfully`,
      });
    } catch (error) {
      console.error(`Delete ${label} error:`, error);
      return res.status(500).json({
        success: false,
        message: `Failed to delete ${label.toLowerCase()}`,
      });
    }
  };

  const approveItem = async (req, res) => {
    try {
      const item = await Model.findByIdAndUpdate(
        req.params.id,
        {
          status: "approved",
          reviewedBy: req.admin.id,
          rejectionReason: "",
        },
        { new: true }
      );

      if (!item) {
        return res.status(404).json({
          success: false,
          message: `${label} not found`,
        });
      }

      return res.status(200).json({
        success: true,
        message: `${label} approved successfully`,
        item,
      });
    } catch (error) {
      console.error(`Approve ${label} error:`, error);
      return res.status(500).json({
        success: false,
        message: `Failed to approve ${label.toLowerCase()}`,
      });
    }
  };

  const rejectItem = async (req, res) => {
    try {
      const item = await Model.findByIdAndUpdate(
        req.params.id,
        {
          status: "rejected",
          reviewedBy: req.admin.id,
          rejectionReason: req.body.rejectionReason || "",
        },
        { new: true }
      );

      if (!item) {
        return res.status(404).json({
          success: false,
          message: `${label} not found`,
        });
      }

      return res.status(200).json({
        success: true,
        message: `${label} rejected successfully`,
        item,
      });
    } catch (error) {
      console.error(`Reject ${label} error:`, error);
      return res.status(500).json({
        success: false,
        message: `Failed to reject ${label.toLowerCase()}`,
      });
    }
  };

  return {
    createItem,
    getPublicItems,
    getPublicItemById,
    getUserItems,
    getAdminItems,
    getPendingItems,
    updateItem,
    deleteItem,
    approveItem,
    rejectItem,
  };
};

export default createContentController;
