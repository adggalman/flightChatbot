const axios = require('axios');

  const linearClient = axios.create({
    baseURL: 'https://api.linear.app/graphql',
    headers: {
      'Authorization': process.env.LINEAR_API_KEY,
      'Content-Type': 'application/json',
    },
  });

  const createIssue = async (title, description, labelId) => {
    const mutation = `
      mutation CreateIssue($title: String!, $teamId: String!, $stateId: String!, $description: String, $labelIds: [String!]) {
        issueCreate(input: {
          title: $title,
          teamId: $teamId,
          stateId: $stateId,
          description: $description,
          labelIds: $labelIds
        }) {
          issue { id identifier }
        }
      }
    `;
    const res = await linearClient.post('', {
      query: mutation,
      variables: {
        title,
        teamId: process.env.LINEAR_TEAM_ID,
        stateId: process.env.LINEAR_STATE_IN_PROGRESS,
        description,
        labelIds: labelId ? [labelId] : [],
      },
    });
    if (res.data.errors) {
        console.warn('Linear createIssue errors:', JSON.stringify(res.data.errors));
      }
    return res.data.data.issueCreate.issue;
  };

  const updateIssueStatus = async (issueId, passed) => {
    const stateId = passed
      ? process.env.LINEAR_STATE_DONE
      : process.env.LINEAR_STATE_CANCELED;

    const mutation = `
      mutation {
        issueUpdate(id: "${issueId}", input: { stateId: "${stateId}" }) {
          issue { id identifier state { name } }
        }
      }
    `;
    await linearClient.post('', { query: mutation });
  };

  const addComment = async (issueId, body) => {
    const mutation = `
      mutation AddComment($issueId: String!, $body: String!) {
        commentCreate(input: {
          issueId: $issueId,
          body: $body
        }) {
          comment { id }
        }
      }
    `;
    await linearClient.post('', {
      query: mutation,
      variables: { issueId, body },
    });
  };

  const createLabel = async (name) => {
    const mutation = `
      mutation CreateLabel($name: String!, $teamId: String!) {
        issueLabelCreate(input: {
          name: $name,
          teamId: $teamId,
          color: "#6366f1"
        }) {
          issueLabel { id name }
        }
      }
    `;
    const res = await linearClient.post('', {
      query: mutation,
      variables: {
        name,
        teamId: process.env.LINEAR_TEAM_ID,
      },
    });
    return res.data.data.issueLabelCreate.issueLabel;
  };

  module.exports = {createLabel, createIssue, updateIssueStatus, addComment };