export default function getConversationKey(userOneId, userTwoId) {
    return [userOneId.toString(), userTwoId.toString()].sort().join("_");
}