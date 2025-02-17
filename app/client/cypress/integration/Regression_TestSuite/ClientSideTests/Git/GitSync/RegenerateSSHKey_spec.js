import gitSyncLocators from "../../../../../locators/gitSyncLocators";
import * as _ from "../../../../../support/Objects/ObjectsCore";

describe("Git regenerate SSH key flow", function() {
  let repoName, newWorkspaceName;

  before(() => {
    cy.NavigateToHome();
    cy.createWorkspace();
    cy.wait("@createWorkspace").then((interception) => {
      newWorkspaceName = interception.response.body.data.name;
      cy.CreateAppForWorkspace(newWorkspaceName, newWorkspaceName);
    });
  });

  it("1. Verify SSH key regeneration flow ", () => {
    _.gitSync.CreateNConnectToGit(repoName);
    cy.get("@gitRepoName").then((repName) => {
      repoName = repName;
      cy.regenerateSSHKey(repoName);
    });
    cy.get("body").click(0, 0);
    cy.wait(2000);
  });

  it("2. Verify error meesage is displayed when ssh key is not added to github", () => {
    cy.wait(2000);
    cy.get(gitSyncLocators.bottomBarCommitButton).click();
    cy.get("[data-cy=t--tab-GIT_CONNECTION]").click();
    cy.wait(2000);
    cy.get(gitSyncLocators.SSHKeycontextmenu).click();
    cy.get(gitSyncLocators.regenerateSSHKeyECDSA).click();
    cy.contains(Cypress.env("MESSAGES").REGENERATE_KEY_CONFIRM_MESSAGE());
    cy.xpath(gitSyncLocators.confirmButton).click();
    cy.reload();
    cy.wait(2000);
    cy.validateToastMessage(Cypress.env("MESSAGES").ERROR_GIT_AUTH_FAIL());
    cy.wait("@gitStatus");
    cy.wait("@gitStatus").should(
      "have.nested.property",
      "response.body.responseMeta.status",
      400,
    );
  });

  it("3. Verify RSA SSH key regeneration flow ", () => {
    cy.regenerateSSHKey(repoName, true, "RSA");
    cy.get("body").click(0, 0);
    cy.wait(2000);
  });

  after(() => {
    //clean up
    _.gitSync.DeleteTestGithubRepo(repoName);
  });
});
