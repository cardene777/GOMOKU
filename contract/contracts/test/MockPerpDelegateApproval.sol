// SPDX-License-Identifier: BUSL-1.1-3.0-or-later
pragma solidity ^0.8.19;

contract MockPerpDelegateApproval {

    event DelegationApproved(address indexed trader, address delegate, uint8 actions);

    mapping(bytes32 => uint8) internal _approvalMap;

    function approve(address delegate, uint8 actions) external {
        address trader = msg.sender;
        bytes32 key = _getApprovalKey(trader, delegate);

        // Examples:
        // oldApprovedActions: 001
        // actions: 010
        // newApprovedActions: 011

        // oldApprovedActions: 010
        // actions: 110
        // newApprovedActions: 110

        // oldApprovedActions: 010
        // actions: 100
        // newApprovedActions: 110
        _approvalMap[key] = _approvalMap[key] | actions;

        emit DelegationApproved(trader, delegate, actions);
    }

     function _getApprovalKey(address trader, address delegate) internal pure returns (bytes32) {
        return keccak256(abi.encode(trader, delegate));
    }
}
