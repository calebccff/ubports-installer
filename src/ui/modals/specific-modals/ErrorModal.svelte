<script>
  import { createEventDispatcher } from "svelte";
  const { ipcRenderer } = require("electron");
  import Modal from "./Modal.svelte";

  const dispatch = createEventDispatcher();

  export let isOpen;
  export let errorData;

  let showNotLatestStable;
  let showGenericUpdateInstructionsError;
  let showSnapUpdateInstructionsError;

  function handleTryAgainButton() {
    ipcRenderer.send("user:error:reply", "restart");
    close();
  }

  function handleIgnoreButton() {
    ipcRenderer.send("user:error:reply", "ignore");
    close();
  }

  const close = () => dispatch("close");
</script>

<Modal {isOpen} on:close={close} showCloseButton={false}>
  <h4 slot="header">Yikes!</h4>
  <div slot="content">
    <p>
      The Installation stopped due to a problem. You can choose to ignore this,
      or re-start the installation process.
    </p>
    <p>
      If this continues to happen, please check if you are affected by <a
        href="https://github.com/ubports/ubports-installer/issues"
        >a known bug</a
      >.
    </p>
    <p>
      If your problem is not yet known, click the button below to report a new
      bug.
    </p>
    <pre>{errorData}</pre>
    {#if showNotLatestStable}
      <p>
        You are not using the latest stable version of the UBports Installer.
      </p>
    {/if}
    {#if showGenericUpdateInstructionsError}
      <p>
        You can <a
          href="https://github.com/ubports/ubports-installer/releases/latest"
          >download the latest version from GitHub</a
        >.
      </p>
    {/if}
    {#if showSnapUpdateInstructionsError}
      <p>
        Run <code>snap refresh ubports-installer --stable</code> in your terminal
        to install the latest version.
      </p>
    {/if}
    <p>
      If you need help, you can join UBports' support channels on
      <a href="https://t.me/WelcomePlus">telegram</a>
      or
      <a
        href="https://matrix.to/#/!KwdniMNeTmClpgHkND:matrix.org?via=matrix.org&via=ubports.chat&via=disroot.org"
        >matrix</a
      >
      or ask a question
      <a href="https://forums.ubports.com">in the forum</a>
      or on
      <a href="https://askubuntu.com">askubuntu</a>.
    </p>
  </div>
  <div slot="actions">
    <button class="btn btn-default" on:click={() => handleTryAgainButton()}
      >Try again</button
    >
    <button class="btn btn-default" on:click={() => handleIgnoreButton()}
      >Ignore</button
    >
    <button
      id="btn-bugreport"
      class="btn btn-primary"
      on:click={() => ipcRenderer.send("user:error:reply", "bugreport")}
      >Report a bug</button
    >
  </div>
</Modal>
