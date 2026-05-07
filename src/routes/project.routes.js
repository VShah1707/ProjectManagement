import { Router } from "express";
import {
  addMembersToProject,
  createProject,
  deleteMember,
  deleteProject,
  getProjectById,
  getProjectMembers,
  updateProject,
  getProjects,
  updateMemberRole,
} from "../controllers/project.controllers.js";
import { validate } from "../middlewares/validator.middleware.js";
import {
  verifyJWT,
  validateProjectPermission,
} from "../middlewares/auth.middleware.js";
import {
  addMembersProjectValidator,
  createProjectValidator,
} from "../validators/index.js";
import { AvailableUserRole, UserRolesEnum } from "../utils/constants.js";

const router = Router();
router.use(verifyJWT);

router
  .route("/")
  .get(getProjects)
  .post(createProjectValidator(), validate, createProject);

router
  .route("/:projectId")
  .get(validateProjectPermission(AvailableUserRole), getProjectById)
  .delete(validateProjectPermission([UserRolesEnum.ADMIN]), deleteProject)
  .put(
    validateProjectPermission([UserRolesEnum.ADMIN, UserRolesEnum.MEMBER]),
    createProjectValidator(),
    updateProject,
  );

// Add members to any project
router
  .route("/members/:projectId")
  .getProjectMembers()
  .post(
    validateProjectPermission([UserRolesEnum.ADMIN]),
    addMembersProjectValidator(),
    validate,
    addMembersToProject,
  );

router
.route("/members/:projectId/:userId")
.put(validateProjectPermission([UserRolesEnum.ADMIN]),updateMemberRole)
.delete(validateProjectPermission([UserRolesEnum.ADMIN]),deleteMember)

export default router;
