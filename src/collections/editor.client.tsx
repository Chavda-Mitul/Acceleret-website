"use client";

import { useEffect } from "react";
import { $isUploadNode, createClientFeature, UploadNode } from "@payloadcms/richtext-lexical/client";
import { $getNodeByKey, $isElementNode, type ElementNode, type LexicalNode } from "@payloadcms/richtext-lexical/lexical";
import { useLexicalComposerContext } from "@payloadcms/richtext-lexical/lexical/react/LexicalComposerContext";
import { $dfsIterator } from "@payloadcms/richtext-lexical/lexical/utils";

/**
 * Moves the right half of a split block back into the left half, and does the
 * same for nested blocks the split also cut through (the list item inside a list).
 */
function $rejoin(left: ElementNode, right: ElementNode, isNew: (node: LexicalNode) => boolean) {
  const leftEnd = left.getLastChild();
  const rightStart = right.getFirstChild();
  if (
    $isElementNode(leftEnd) &&
    $isElementNode(rightStart) &&
    leftEnd.getType() === rightStart.getType() &&
    isNew(rightStart)
  ) {
    $rejoin(leftEnd, rightStart, isNew);
  }
  left.append(...right.getChildren());
  right.remove();
}

/**
 * Payload drops, pastes or inserts an image at the exact caret position, so a
 * paragraph gets cut in two, often mid-word ("th" / "e editor"). This puts the
 * paragraph back together with the image after it. To place an image between two
 * sentences, press Enter there first.
 *
 * It also clears upload placeholders left behind when the page was closed with
 * the alt-text drawer still open: their preview is gone, and Publish rejects them.
 */
function ImagePlacementPlugin() {
  const [editor] = useLexicalComposerContext();

  useEffect(() => {
    const stale = editor.getEditorState().read(() =>
      [...$dfsIterator()]
        // `pending` is internal to Payload, so it isn't in the UploadData type.
        .filter(({ node }) => $isUploadNode(node) && Boolean((node.getData() as { pending?: unknown }).pending))
        .map(({ node }) => node.getKey()),
    );
    if (stale.length) {
      editor.update(() => stale.forEach((key) => $getNodeByKey(key)?.remove()));
    }

    return editor.registerNodeTransform(UploadNode, (node) => {
      // Several files dropped at once land side by side; treat them as one gap.
      let first: LexicalNode = node;
      while ($isUploadNode(first.getPreviousSibling())) first = first.getPreviousSibling()!;
      let last: LexicalNode = node;
      while ($isUploadNode(last.getNextSibling())) last = last.getNextSibling()!;

      const before = first.getPreviousSibling();
      const after = last.getNextSibling();
      if (!$isElementNode(before) || !$isElementNode(after) || before.getType() !== after.getType()) return;
      const textBefore = before.getTextContent();
      const textAfter = after.getTextContent();
      if (!textBefore || !textAfter) return;

      // During an update, getEditorState() is still the state from before it.
      const previous = editor.getEditorState();
      const isNew = (n: LexicalNode) => !previous.read(() => $getNodeByKey(n.getKey()));
      const wasSplit = previous.read(() => $getNodeByKey(before.getKey())?.getTextContent() === textBefore + textAfter);
      if (wasSplit && isNew(after)) $rejoin(before, after, isNew);
    });
  }, [editor]);

  return null;
}

export const ImagePlacementFeatureClient = createClientFeature({
  plugins: [{ Component: ImagePlacementPlugin, position: "normal" }],
});
